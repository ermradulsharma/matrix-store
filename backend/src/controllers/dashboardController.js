const catchAsyncError = require("../middlewares/catchAsyncErrors");
const User = require("../models/User");
const Product = require("../models/Product"); // Assuming Product model exists
const Order = require("../models/Order"); // Assuming Order model exists

exports.getSuperAdminStats = catchAsyncError(async (req, res, next) => {
  let userFilter = {};
  let productFilter = {};
  let orderFilter = {};

  // Hierarchy Filtering for Admin and Manager
  if (req.user.role === 'admin' || req.user.role === 'manager') {
    // 1. Get Users managed by the requester
    const managedUsers = await User.find({ managedBy: req.user.id });
    const managedUserIds = managedUsers.map(u => u._id);

    userFilter = { _id: { $in: managedUserIds } };
    productFilter = { user_id: { $in: managedUserIds } };
    orderFilter = { user: { $in: managedUserIds } }; // Orders placed by my managed Customers
  }

  // Fetch Data with Filters
  const users = await User.find(userFilter); // This might be redundant if we just fetched managedUsers, but keeps logic clean for super_admin
  const products = await Product.countDocuments(productFilter);
  const orders = await Order.find(orderFilter);

  // Get Available Years for Dropdown
  const distinctYears = await Order.aggregate([
    { $match: orderFilter },
    { $project: { year: { $year: "$createdAt" } } },
    { $group: { _id: "$year" } },
    { $sort: { _id: -1 } }
  ]);
  const availableYears = distinctYears.map(y => y._id);

  // Determine Filter Year (Default to current year if not provided, or consider allow "All Time" but chart might look messy)
  // User asked for "Year List", implying specific year selection to view MONTHLY data for that year.
  // If no year provided, default to current year for the chart to make sense (Jan-Dec).
  const currentYear = new Date().getFullYear();
  const selectedYear = req.query.year ? parseInt(req.query.year) : currentYear;

  // Determine Logic: Daily (Jan of Current Year) vs Monthly (Rest)
  const isCurrentYear = selectedYear === currentYear;
  const today = new Date();
  const currentMonthIndex = today.getMonth(); // 0 = Jan, 1 = Feb
  let revenueData = [];

  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  if (isCurrentYear && currentMonthIndex === 0) {
    // --- SCENARIO 1: Current Year && January -> Show DAILY ---
    const startOfJan = new Date(selectedYear, 0, 1);
    const endTime = new Date(); // Now

    const dailyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfJan, $lte: endTime },
          ...orderFilter
        }
      },
      {
        $group: {
          _id: { $dayOfMonth: "$createdAt" },
          total: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill from Day 1 to Today
    const currentDay = today.getDate();
    for (let d = 1; d <= currentDay; d++) {
      const dayData = dailyRevenue.find(item => item._id === d);
      revenueData.push({ name: `${d}`, total: dayData ? dayData.total : 0 });
    }

  } else if (isCurrentYear) {
    // --- SCENARIO 2: Current Year && Feb+ -> Show MONTHLY up to current month ---
    const startOfYear = new Date(selectedYear, 0, 1);
    const endTime = new Date();

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfYear, $lte: endTime },
          ...orderFilter
        }
      },
      {
        $group: {
          // Note: $month in Mongo is 1-12
          _id: { $month: "$createdAt" },
          total: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Fill from Jan (0) to Current Month Index
    for (let m = 0; m <= currentMonthIndex; m++) {
      const dbMonth = m + 1;
      const monthData = monthlyRevenue.find(item => item._id === dbMonth);
      revenueData.push({ name: monthNames[m], total: monthData ? monthData.total : 0 });
    }

  } else {
    // --- SCENARIO 3: Past / Future Year -> Show Full 12 Months ---
    const startOfYear = new Date(selectedYear, 0, 1);
    const endOfYear = new Date(selectedYear + 1, 0, 1);

    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfYear, $lt: endOfYear },
          ...orderFilter
        }
      },
      {
        $group: {
          _id: { $month: "$createdAt" },
          total: { $sum: "$totalPrice" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Initialize all 12 months with 0
    revenueData = monthNames.map(name => ({ name, total: 0 }));

    // Merge DB data
    monthlyRevenue.forEach((item) => {
      if (item._id >= 1 && item._id <= 12) {
        revenueData[item._id - 1].total = item.total;
      }
    });
  }

  // 2. Order Status Distribution with Filter
  const orderStatusCounts = await Order.aggregate([
    { $match: orderFilter }, // Apply filter
    { $group: { _id: "$orderStatus", count: { $sum: 1 } } },
  ]);
  const pieData = orderStatusCounts.map((item) => ({
    name: item._id,
    value: item.count,
  }));

  // 3. Recent Orders (Last 5) with Filter
  const recentOrders = await Order.find(orderFilter)
    .sort({ createdAt: -1 })
    .limit(5)
    .populate("user", "name email");

  // 4. Geographic Sales Distribution
  // Sales by Country
  const salesByCountry = await Order.aggregate([
    { $match: orderFilter },
    {
      $group: {
        _id: "$shippingInfo.country",
        totalSales: { $sum: "$totalPrice" },
        count: { $sum: 1 }
      }
    },
    { $sort: { totalSales: -1 } }
  ]);

  // Sales by State
  const salesByState = await Order.aggregate([
    { $match: orderFilter },
    {
      $group: {
        _id: "$shippingInfo.state",
        totalSales: { $sum: "$totalPrice" },
        count: { $sum: 1 }
      }
    },
    { $sort: { totalSales: -1 } }
  ]);

  // Sales by City
  const salesByCity = await Order.aggregate([
    { $match: orderFilter },
    {
      $group: {
        _id: "$shippingInfo.city",
        totalSales: { $sum: "$totalPrice" },
        count: { $sum: 1 }
      }
    },
    { $sort: { totalSales: -1 } }
  ]);

  const stats = {
    users: {
      total: users.length,
      admin: users.filter((u) => u.role === "admin").length,
      manager: users.filter((u) => u.role === "manager").length,
      provider: users.filter((u) => u.role === "provider").length,
      customer: users.filter((u) => u.role === "customer").length,
    },
    products: products,
    orders: {
      total: orders.length,
      totalAmount: orders.reduce(
        (acc, order) => acc + (order.totalPrice || 0),
        0
      ),
    },
    revenueData,
    pieData,
    recentOrders,
    geoStats: {
      country: salesByCountry.map(item => ({ name: item._id, value: item.totalSales, count: item.count })),
      state: salesByState.map(item => ({ name: item._id, value: item.totalSales, count: item.count })),
      city: salesByCity.map(item => ({ name: item._id, value: item.totalSales, count: item.count }))
    },
    availableYears,
    selectedYear
  };

  res.status(200).json({
    success: true,
    stats,
  });
});

exports.getAdvancedStats = catchAsyncError(async (req, res, next) => {
  const { period } = req.query; // daily, weekly, monthly, yearly

  // Get Available Years (Same logic as SuperAdminStats)
  const distinctYears = await Order.aggregate([
    { $project: { year: { $year: "$createdAt" } } },
    { $group: { _id: "$year" } },
    { $sort: { _id: -1 } }
  ]);
  const dbYears = distinctYears.map(y => y._id);
  const currentYear = new Date().getFullYear();
  const rangeYears = [];
  for (let i = 0; i < 5; i++) {
    rangeYears.push(currentYear - i);
  }
  const availableYears = [...new Set([...dbYears, ...rangeYears])].sort((a, b) => b - a);

  let dateFilter = {};
  let groupBy = {};
  let sortBy = { _id: 1 };

  const now = new Date();

  // If a YEAR is provided, use logic specific to formatting for that year
  // Otherwise use standard "Last X days/months" periods

  let formattedTrend = [];

  if (req.query.year) {
    const selectedYear = parseInt(req.query.year);
    const isCurrentYear = selectedYear === currentYear;
    const startOfYear = new Date(selectedYear, 0, 1);
    const endOfYear = new Date(selectedYear + 1, 0, 1);

    if (period === 'monthly') {
      // --- MONTHLY (Keep Smart Logic) ---
      const today = new Date();
      const currentMonthIndex = today.getMonth(); // 0 = Jan
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

      if (isCurrentYear && currentMonthIndex === 0) {
        // Daily View for Jan
        const endTime = new Date();
        dateFilter = { createdAt: { $gte: startOfYear, $lte: endTime } };

        const dailyRevenue = await Order.aggregate([
          { $match: dateFilter },
          { $group: { _id: { $dayOfMonth: "$createdAt" }, total: { $sum: "$totalPrice" }, count: { $sum: 1 } } },
          { $sort: { _id: 1 } }
        ]);

        const currentDay = today.getDate();
        for (let d = 1; d <= currentDay; d++) {
          const dayData = dailyRevenue.find(item => item._id === d);
          formattedTrend.push({ name: `${d}`, value: dayData ? dayData.total : 0, count: dayData ? dayData.count : 0 });
        }
      } else if (isCurrentYear) {
        // Monthly View up to current month (Scenario 2)
        const endTime = new Date();
        dateFilter = { createdAt: { $gte: startOfYear, $lte: endTime } };

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
        // Full Year View (Scenario 3)
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
      // --- DAILY (All days in selected year) ---
      // Use full year range for consistency
      dateFilter = { createdAt: { $gte: startOfYear, $lt: endOfYear } };
      const endTime = new Date();

      const dailyRevenue = await Order.aggregate([
        { $match: dateFilter },
        { $group: { _id: { day: { $dayOfMonth: "$createdAt" }, month: { $month: "$createdAt" } }, total: { $sum: "$totalPrice" }, count: { $sum: 1 } } },
        { $sort: { "_id.month": 1, "_id.day": 1 } }
      ]);

      // Generate all days for the year
      const daysInYear = (selectedYear % 4 === 0 && selectedYear % 100 !== 0) || selectedYear % 400 === 0 ? 366 : 365;
      const tempDate = new Date(selectedYear, 0, 1);

      for (let i = 0; i < daysInYear; i++) {
        // Stop if future date in current year
        if (isCurrentYear && tempDate > endTime) break;

        const d = tempDate.getDate();
        const m = tempDate.getMonth() + 1; // 1-index

        const dayData = dailyRevenue.find(item => item._id.day === d && item._id.month === m);

        formattedTrend.push({
          name: tempDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: dayData ? dayData.total : 0,
          count: dayData ? dayData.count : 0
        });

        tempDate.setDate(tempDate.getDate() + 1);
      }

    } else if (period === 'weekly') {
      // --- WEEKLY (Weeks 1-52/53 of selected year) ---
      dateFilter = { createdAt: { $gte: startOfYear, $lt: endOfYear } };

      const weeklyRevenue = await Order.aggregate([
        { $match: dateFilter },
        { $group: { _id: { $isoWeek: "$createdAt" }, total: { $sum: "$totalPrice" }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]);

      // Determine max week
      // For ISO weeks, usually 52, sometimes 53
      // For current year, calculate ISO week of today
      let maxWeek = 52;

      // Simple ISO Week calculation function for current date
      const getISOWeek = (d) => {
        const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        const dayNum = date.getUTCDay() || 7;
        date.setUTCDate(date.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
        return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
      };

      if (isCurrentYear) {
        maxWeek = getISOWeek(new Date());
      } else {
        // Check if selected year has 53 weeks ?? Simplification: Use 52, checks for 53 if data exists? 
        // Most years have 52. 
        // If data exists for week 53, expand.
        const hasWeek53 = weeklyRevenue.some(item => item._id === 53);
        if (hasWeek53) maxWeek = 53;
      }

      for (let w = 1; w <= maxWeek; w++) {
        const weekData = weeklyRevenue.find(item => item._id === w);
        formattedTrend.push({
          name: `Week ${w}`,
          value: weekData ? weekData.total : 0,
          count: weekData ? weekData.count : 0
        });
      }
    } else if (period === 'yearly') {
      // --- YEARLY (Just the selected year) ---
      dateFilter = { createdAt: { $gte: startOfYear, $lt: endOfYear } };
      const yearlyRevenue = await Order.aggregate([
        { $match: dateFilter },
        { $group: { _id: { $year: "$createdAt" }, total: { $sum: "$totalPrice" }, count: { $sum: 1 } } }
      ]);
      formattedTrend = yearlyRevenue.map(item => ({
        name: `${item._id}`,
        value: item.total,
        count: item.count
      }));
    }

  } else {
    // STANDARD LOGIC for non-year specific requests
    switch (period) {
      case "daily":
        dateFilter = { createdAt: { $gte: new Date(now.setDate(now.getDate() - 30)) } };
        groupBy = { day: { $dayOfMonth: "$createdAt" }, month: { $month: "$createdAt" } };
        break;
      case "weekly":
        dateFilter = { createdAt: { $gte: new Date(now.setDate(now.getDate() - 90)) } };
        groupBy = { week: { $week: "$createdAt" }, year: { $year: "$createdAt" } };
        break;
      case "monthly":
        dateFilter = { createdAt: { $gte: new Date(now.setMonth(now.getMonth() - 12)) } };
        groupBy = { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } };
        break;
      case "yearly":
        dateFilter = {};
        groupBy = { year: { $year: "$createdAt" } };
        break;
      default:
        dateFilter = { createdAt: { $gte: new Date(now.setMonth(now.getMonth() - 12)) } };
        groupBy = { month: { $month: "$createdAt" }, year: { $year: "$createdAt" } };
    }

    const revenueTrend = await Order.aggregate([
      { $match: dateFilter },
      { $group: { _id: groupBy, total: { $sum: "$totalPrice" }, count: { $sum: 1 } } },
      { $sort: sortBy },
    ]);

    formattedTrend = revenueTrend.map((item) => {
      let label = "";
      if (item._id.day) label = `${item._id.day}/${item._id.month}`;
      else if (item._id.week) label = `Week ${item._id.week}`;
      else if (item._id.month) label = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][item._id.month - 1];
      else if (item._id.year) label = `${item._id.year}`;
      return { name: label, value: item.total, count: item.count };
    });
  }

  // 2. Top Selling Products
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
    {
      $lookup: {
        from: "products",
        localField: "_id",
        foreignField: "_id",
        as: "productDetails",
      },
    },
    { $unwind: "$productDetails" },
    {
      $project: {
        name: "$productDetails.name",
        quantity: "$totalQuantity",
        revenue: "$totalRevenue",
        owner: "$productDetails.user_id",
      },
    },
  ]);

  // 3. Sales By Product Owner Role
  const salesByRole = await Order.aggregate([
    { $match: dateFilter },
    { $unwind: "$orderItems" },
    {
      $lookup: {
        from: "products",
        localField: "orderItems.product",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },
    {
      $lookup: {
        from: "users",
        localField: "product.user_id",
        foreignField: "_id",
        as: "owner",
      },
    },
    { $unwind: "$owner" },
    {
      $group: {
        _id: "$owner.role",
        totalRevenue: { $sum: { $multiply: ["$orderItems.price", "$orderItems.quantity"] } },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    trend: formattedTrend,
    topProducts,
    salesByRole: salesByRole.map((s) => ({
      name: s._id,
      value: s.totalRevenue,
    })),
    availableYears // Return available years for frontend dropdown
  });
});
