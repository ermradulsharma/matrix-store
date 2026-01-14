class features {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }
    search() {
        const keyword = this.queryStr.keyword ? {
            name: {
                $regex: this.queryStr.keyword,
                // use for case sensitive
                $options: "i",
            }
        } : {}

        this.query = this.query.find({ ...keyword });
        return this;
    }
    filter() {
        // First we make a copy of query string
        const queryCopy = { ...this.queryStr };

        // Revome query key 
        const removeFields = ["keyword", "page", "limit", "category"];
        removeFields.forEach((key) => delete queryCopy[key]);

        // filter for Price and Ratings
        let queryStr = JSON.stringify(queryCopy);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`);
        this.query = this.query.find(JSON.parse(queryStr));
        return this;
    }
    pagination(resultPerPage) {
        const currentPage = Number(this.queryStr.page) || 1;
        const skip = resultPerPage * (currentPage - 1);
        this.query = this.query.limit(resultPerPage).skip(skip);
        return this;

    }
}
module.exports = features