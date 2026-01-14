const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

// Helper for ISO Week
const getISOWeek = (d) => {
    const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const dayNum = date.getUTCDay() || 7;
    date.setUTCDate(date.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
    return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
};

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Helper to get all descendant IDs in the management hierarchy
const getAllDescendantIds = async (userId) => {
    let descendantIds = [];
    const children = await User.find({ managedBy: userId }).select("_id");
    const childIds = children.map(c => c._id);

    if (childIds.length > 0) {
        descendantIds = [...childIds];
        for (const childId of childIds) {
            const grandchildrenIds = await getAllDescendantIds(childId);
            descendantIds = descendantIds.concat(grandchildrenIds);
        }
    }
    return descendantIds;
};

// Get SuperAdmin / Hierarchical Stats
exports.getSuperAdminStats = async (user, query) => {
    let userFilter = {};
    let productFilter = {};
    let orderFilter = {};
    let managedUserIds = [];

    if (user.role !== 'super_admin') {
        managedUserIds = await getAllDescendantIds(user.id);
        // Include the user themselves for things they might own directly (though roles usually dictate this)
        const allRelevantUserIds = [...managedUserIds, user._id];

        userFilter = { _id: { $in: managedUserIds } }; // Stats show people they MANAGE
        productFilter = { user_id: { $in: allRelevantUserIds } }; // Products owned by them or their descendants

        // For orders, we need a special lookup: 
        // 1. Orders placed by people they manage (original logic)
        // OR 2. Orders containing products owned by them/their descendants (vendor logic)
        // We will combine these filters or prioritize based on role expectations.
        // For Admin/Manager dashboard, we usually want to see sales of products owned by their team.
        orderFilter = {
            $or: [
                { user: { $in: managedUserIds } },
                { "orderItems.product": { $in: await Product.find(productFilter).distinct("_id") } }
            ]
        };
    }

    const users = await User.find(userFilter);
    const productsCount = await Product.countDocuments(productFilter);

    // For hierarchical roles, we must calculate order-related stats carefully 
    // because an order might contain items from multiple vendors.
    const allOrders = await Order.find(orderFilter).populate("orderItems.product");

    let totalOrdersCount = 0;
    let totalRevenueAmount = 0;
    const filteredOrderIds = new Set();

    if (user.role === 'super_admin') {
        totalOrdersCount = allOrders.length;
        totalRevenueAmount = allOrders.reduce((acc, order) => acc + (order.totalPrice || 0), 0);
        allOrders.forEach(o => filteredOrderIds.add(o._id.toString()));
    } else {
        const managedProductIds = (await Product.find(productFilter).distinct("_id")).map(id => id.toString());

        allOrders.forEach(order => {
            let orderHasManagedItems = false;
            order.orderItems.forEach(item => {
                if (managedProductIds.includes(item.product._id.toString())) {
                    totalRevenueAmount += (item.price * item.quantity);
                    orderHasManagedItems = true;
                }
            });
            if (orderHasManagedItems) {
                totalOrdersCount++;
                filteredOrderIds.add(order._id.toString());
            }
        });
    }

    const finalOrderFilter = { _id: { $in: Array.from(filteredOrderIds).map(id => new (require('mongoose').Types.ObjectId)(id)) } };

    const distinctYears = await Order.aggregate([
        { $match: finalOrderFilter },
        { $project: { year: { $year: "$createdAt" } } },
        { $group: { _id: "$year" } },
        { $sort: { _id: -1 } }
    ]);
    const availableYears = distinctYears.map(y => y._id);

    const currentYear = new Date().getFullYear();
    const selectedYear = query.year ? parseInt(query.year) : currentYear;
    const isCurrentYear = selectedYear === currentYear;
    const today = new Date();
    const currentMonthIndex = today.getMonth();
    let revenueData = [];

    // Helper to aggregate revenue by time for filtered orders and managed products
    const aggregateRevenue = async (matchStage, groupById) => {
        const orders = await Order.find(matchStage).populate("orderItems.product");
        const results = {};

        const managedProductIds = user.role === 'super_admin' ? null : (await Product.find(productFilter).distinct("_id")).map(id => id.toString());

        orders.forEach(order => {
            const key = groupById(order.createdAt);
            order.orderItems.forEach(item => {
                if (user.role === 'super_admin' || managedProductIds.includes(item.product._id.toString())) {
                    results[key] = (results[key] || 0) + (item.price * item.quantity);
                }
            });
        });
        return results;
    };

    if (isCurrentYear && currentMonthIndex === 0) {
        const startOfJan = new Date(selectedYear, 0, 1);
        const dataMap = await aggregateRevenue(
            { createdAt: { $gte: startOfJan, $lte: today }, ...finalOrderFilter },
            (date) => date.getDate()
        );
        const currentDay = today.getDate();
        for (let d = 1; d <= currentDay; d++) {
            revenueData.push({ name: `${d}`, total: dataMap[d] || 0 });
        }
    } else if (isCurrentYear) {
        const startOfYear = new Date(selectedYear, 0, 1);
        const dataMap = await aggregateRevenue(
            { createdAt: { $gte: startOfYear, $lte: today }, ...finalOrderFilter },
            (date) => date.getMonth() + 1
        );
        for (let m = 0; m <= currentMonthIndex; m++) {
            revenueData.push({ name: monthNames[m], total: dataMap[m + 1] || 0 });
        }
    } else {
        const startOfYear = new Date(selectedYear, 0, 1);
        const endOfYear = new Date(selectedYear + 1, 0, 1);
        const dataMap = await aggregateRevenue(
            { createdAt: { $gte: startOfYear, $lt: endOfYear }, ...finalOrderFilter },
            (date) => date.getMonth() + 1
        );
        revenueData = monthNames.map((name, i) => ({ name, total: dataMap[i + 1] || 0 }));
    }

    const orderStatusCounts = await Order.aggregate([
        { $match: finalOrderFilter },
        { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
    ]);
    const pieData = orderStatusCounts.map((item) => ({ name: item._id, value: item.count }));

    const recentOrders = await Order.find(finalOrderFilter)
        .sort({ createdAt: -1 })
        .limit(5)
        .populate("user", "name email");

    const getGeoStats = async (field) => {
        const orders = await Order.find(finalOrderFilter).populate("orderItems.product");
        const stats = {};
        const managedProductIds = user.role === 'super_admin' ? null : (await Product.find(productFilter).distinct("_id")).map(id => id.toString());

        orders.forEach(order => {
            const key = order.shippingInfo[field];
            if (!stats[key]) stats[key] = { totalSales: 0, count: 0 };

            let managedItemsInOrder = 0;
            order.orderItems.forEach(item => {
                if (user.role === 'super_admin' || managedProductIds.includes(item.product._id.toString())) {
                    stats[key].totalSales += (item.price * item.quantity);
                    managedItemsInOrder++;
                }
            });
            if (managedItemsInOrder > 0) stats[key].count++;
        });

        return Object.keys(stats).map(name => ({
            name,
            value: stats[name].totalSales,
            count: stats[name].count
        })).sort((a, b) => b.value - a.value);
    };

    return {
        users: {
            total: users.length,
            admin: users.filter((u) => u.role === "admin").length,
            manager: users.filter((u) => u.role === "manager").length,
            provider: users.filter((u) => u.role === "provider").length,
            customer: users.filter((u) => u.role === "customer").length,
        },
        products: productsCount,
        orders: {
            total: totalOrdersCount,
            totalAmount: totalRevenueAmount,
        },
        revenueData,
        pieData,
        recentOrders,
        geoStats: {
            country: await getGeoStats("country"),
            state: await getGeoStats("state"),
            city: await getGeoStats("city")
        },
        availableYears,
        selectedYear
    };
};

// Get Advanced Trends and Rankings
exports.getAdvancedStats = async (query) => {
    const { period, year } = query;
    const now = new Date();
    const currentYear = now.getFullYear();

    const distinctYears = await Order.aggregate([
        { $project: { year: { $year: "$createdAt" } } },
        { $group: { _id: "$year" } },
        { $sort: { _id: -1 } }
    ]);
    const dbYears = distinctYears.map(y => y._id);
    const rangeYears = [];
    for (let i = 0; i < 5; i++) rangeYears.push(currentYear - i);
    const availableYears = [...new Set([...dbYears, ...rangeYears])].sort((a, b) => b - a);

    let formattedTrend = [];
    let dateFilter = {};

    if (year) {
        const selectedYear = parseInt(year);
        const isCurrentYear = selectedYear === currentYear;
        const startOfYear = new Date(selectedYear, 0, 1);
        const endOfYear = new Date(selectedYear + 1, 0, 1);

        if (period === 'monthly') {
            const currentMonthIndex = now.getMonth();
            if (isCurrentYear && currentMonthIndex === 0) {
                dateFilter = { createdAt: { $gte: startOfYear, $lte: now } };
                const dailyRevenue = await Order.aggregate([
                    { $match: dateFilter },
                    { $group: { _id: { $dayOfMonth: "$createdAt" }, total: { $sum: "$totalPrice" }, count: { $sum: 1 } } },
                    { $sort: { _id: 1 } }
                ]);
                for (let d = 1; d <= now.getDate(); d++) {
                    const dayData = dailyRevenue.find(item => item._id === d);
                    formattedTrend.push({ name: `${d}`, value: dayData ? dayData.total : 0, count: dayData ? dayData.count : 0 });
                }
            } else if (isCurrentYear) {
                dateFilter = { createdAt: { $gte: startOfYear, $lte: now } };
                const monthlyRevenue = await Order.aggregate([
                    { $match: dateFilter },
                    { $group: { _id: { $month: "$createdAt" }, total: { $sum: "$totalPrice" }, count: { $sum: 1 } } },
                    { $sort: { _id: 1 } }
                ]);
                for (let m = 0; m <= currentMonthIndex; m++) {
                    const dbMonth = m + 1;
                    const monthData = monthlyRevenue.find(item => item._id === dbMonth);
                    formattedTrend.push({ name: monthNames[m], value: monthData ? monthData.total : 0, count: monthData ? monthData.count : 0 });
                }
            } else {
                dateFilter = { createdAt: { $gte: startOfYear, $lt: endOfYear } };
                const monthlyRevenue = await Order.aggregate([
                    { $match: dateFilter },
                    { $group: { _id: { $month: "$createdAt" }, total: { $sum: "$totalPrice" }, count: { $sum: 1 } } },
                    { $sort: { _id: 1 } }
                ]);
                formattedTrend = monthNames.map(name => ({ name, value: 0, count: 0 }));
                monthlyRevenue.forEach(item => {
                    if (item._id >= 1 && item._id <= 12) {
                        formattedTrend[item._id - 1].value = item.total;
                        formattedTrend[item._id - 1].count = item.count;
                    }
                });
            }
        } else if (period === 'daily') {
            dateFilter = { createdAt: { $gte: startOfYear, $lt: endOfYear } };
            const dailyRevenue = await Order.aggregate([
                { $match: dateFilter },
                { $group: { _id: { day: { $dayOfMonth: "$createdAt" }, month: { $month: "$createdAt" } }, total: { $sum: "$totalPrice" }, count: { $sum: 1 } } },
                { $sort: { "_id.month": 1, "_id.day": 1 } }
            ]);
            const tempDate = new Date(selectedYear, 0, 1);
            while (tempDate < endOfYear && (!isCurrentYear || tempDate <= now)) {
                const d = tempDate.getDate();
                const m = tempDate.getMonth() + 1;
                const dayData = dailyRevenue.find(item => item._id.day === d && item._id.month === m);
                formattedTrend.push({
                    name: tempDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    value: dayData ? dayData.total : 0,
                    count: dayData ? dayData.count : 0
                });
                tempDate.setDate(tempDate.getDate() + 1);
            }
        } else if (period === 'weekly') {
            dateFilter = { createdAt: { $gte: startOfYear, $lt: endOfYear } };
            const weeklyRevenue = await Order.aggregate([
                { $match: dateFilter },
                { $group: { _id: { $isoWeek: "$createdAt" }, total: { $sum: "$totalPrice" }, count: { $sum: 1 } } },
                { $sort: { _id: 1 } }
            ]);
            let maxWeek = isCurrentYear ? getISOWeek(now) : (weeklyRevenue.some(item => item._id === 53) ? 53 : 52);
            for (let w = 1; w <= maxWeek; w++) {
                const weekData = weeklyRevenue.find(item => item._id === w);
                formattedTrend.push({ name: `Week ${w}`, value: weekData ? weekData.total : 0, count: weekData ? weekData.count : 0 });
            }
        } else if (period === 'yearly') {
            dateFilter = { createdAt: { $gte: startOfYear, $lt: endOfYear } };
            const yearlyRevenue = await Order.aggregate([
                { $match: dateFilter },
                { $group: { _id: { $year: "$createdAt" }, total: { $sum: "$totalPrice" }, count: { $sum: 1 } } }
            ]);
            formattedTrend = yearlyRevenue.map(item => ({ name: `${item._id}`, value: item.total, count: item.count }));
        }
    } else {
        let groupBy = {};
        const tempNow = new Date(now);
        switch (period) {
            case "daily":
                dateFilter = { createdAt: { $gte: new Date(tempNow.setDate(tempNow.getDate() - 30)) } };
                groupBy = { day: { $dayOfMonth: "$createdAt" }, month: { $month: "$createdAt" } };
                break;
            case "weekly":
                dateFilter = { createdAt: { $gte: new Date(tempNow.setDate(tempNow.getDate() - 90)) } };
                groupBy = { week: { $week: "$createdAt" }, year: { $year: "$createdAt" } };
                break;
            case "yearly":
                dateFilter = {};
                groupBy = { year: { $year: "$createdAt" } };
                break;
            case "monthly":
            default:
                dateFilter = { createdAt: { $gte: new Date(tempNow.setMonth(tempNow.getMonth() - 12)) } };
                groupBy = { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } };
        }
        const revenueTrend = await Order.aggregate([
            { $match: dateFilter },
            { $group: { _id: groupBy, total: { $sum: "$totalPrice" }, count: { $sum: 1 } } },
            { $sort: { "_id.year": 1, "_id.month": 1, "_id.week": 1, "_id.day": 1 } },
        ]);
        formattedTrend = revenueTrend.map((item) => {
            let label = "";
            if (item._id.day) label = `${item._id.day}/${item._id.month}`;
            else if (item._id.week) label = `Week ${item._id.week}`;
            else if (item._id.month) label = monthNames[item._id.month - 1];
            else if (item._id.year) label = `${item._id.year}`;
            return { name: label, value: item.total, count: item.count };
        });
    }

    const topProducts = await Order.aggregate([
        { $match: dateFilter },
        { $unwind: "$orderItems" },
        {
            $group: {
                _id: "$orderItems.product",
                totalQuantity: { $sum: "$orderItems.quantity" },
                totalRevenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } },
            },
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 5 },
        { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "productDetails" } },
        { $unwind: "$productDetails" },
        { $project: { name: "$productDetails.name", quantity: "$totalQuantity", revenue: "$totalRevenue", owner: "$productDetails.user_id" } },
    ]);

    const salesByRole = await Order.aggregate([
        { $match: dateFilter },
        { $unwind: "$orderItems" },
        { $lookup: { from: "products", localField: "orderItems.product", foreignField: "_id", as: "product" } },
        { $unwind: "$product" },
        { $lookup: { from: "users", localField: "product.user_id", foreignField: "_id", as: "owner" } },
        { $unwind: "$owner" },
        { $group: { _id: "$owner.role", totalRevenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } } } },
    ]);

    return {
        trend: formattedTrend,
        topProducts,
        salesByRole: salesByRole.map((s) => ({ name: s._id, value: s.totalRevenue })),
        availableYears
    };
};
