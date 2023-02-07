class APIFilters {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryCopy = { ...this.queryString };
    // console.log(queryCopy);
    //remove fields from query
    const removeFields = ["sort", "fields", "q", "limit", "page"];
    removeFields.forEach((element) => delete queryCopy[element]);

    //advanced filter using: gt, gte, lt, lte
    let queryString = JSON.stringify(queryCopy);
    queryString = queryString.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );

    // console.log(JSON.parse(queryString));
    this.query = this.query.find(JSON.parse(queryString));
    return this;
  }

  sort() {
    // console.log(this.queryString);

    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-postingDate");
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
  }

  searchByQuery() {
    if (this.queryString.q) {
      const qu = this.queryString.q.split("-").join(" ");
      this.query = this.query.find({ $text: { $search: '"' + qu + '"' } });
    }
    return this;
  }

  pagination() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 10;

    const skipResults = (page - 1) * limit;

    this.query = this.query.skip(skipResults).limit(limit);
    return this;
  }
}

module.exports = APIFilters;
