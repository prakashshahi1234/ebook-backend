
// Modify your ApiFeatures class as follows:
class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search() {
    const keywords = this.queryStr.keyword ? this.queryStr.keyword.split(/\s+/) : [];
  
    const keywordFilter = keywords.length
      ? {
          $or: [
            { title: { $regex: keywords.join('|'), $options: 'i' } },
            { description: { $regex: keywords.join('|'), $options: 'i' } },
            { keywords: { $regex: keywords.join('|'), $options: 'i' } },
            { category: { $regex: keywords.join('|'), $options: 'i' } },
          ],
        }
      : {};
  
    this.query = this.query
      .find(keywordFilter)
      .select("_id bookId title price author coverImageUrl")
      .populate({
        path: 'author',
        model: 'User', // Replace with the actual model name for the authors
        select: '_id name', // Include other fields you want
      });
  
    return this;
  }
  
  

  filter() {
    // Ensure this.query is defined before calling filter
    if (!this.query) {
      throw new Error('Query is undefined. Call search() method before filter().');
    }

    const queryCopy = { ...this.queryStr };
    const removeFields = ["keyword", "page", "limit"];

    // Rest of the filter logic remains the same
    removeFields.forEach((key) => delete queryCopy[key]);

    if (queryCopy.minPrice) {
      queryCopy.price = { $gte: parseFloat(queryCopy.minPrice) };
      delete queryCopy.minPrice;
    }

    if (queryCopy.maxPrice) {
      queryCopy.price = { ...queryCopy.price, $lte: parseFloat(queryCopy.maxPrice) };
      delete queryCopy.maxPrice;
    }

    if (queryCopy.minRating) {
      queryCopy.rating = { $gte: parseFloat(queryCopy.minRating) };
      delete queryCopy.minRating;
    }

    if (queryCopy.maxRating) {
      queryCopy.rating = { ...queryCopy.rating, $lte: parseFloat(queryCopy.maxRating) };
      delete queryCopy.maxRating;
    }

    this.query = this.query.find(queryCopy);

    return this;
  }

  sort() {
    // Add your sorting logic here
    return this;
  }

  pagination(resultPerPage) {
    const currentPage = Number(this.queryStr.page) || 1;
    const skip = resultPerPage * (currentPage - 1);

    this.query = this.query.limit(resultPerPage).skip(skip);

    return this;
  }

}

module.exports = ApiFeatures;


