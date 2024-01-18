class ApiFeatures {
    constructor(query, queryStr) {
      this.query = query;
      this.queryStr = queryStr;
    }
  
    search() {
      const keyword = this.queryStr.keyword
        ? {
            $or: [
              { name: { $regex: this.queryStr.keyword, $options: "i" } },
              { description: { $regex: this.queryStr.keyword, $options: "i" } },
              { keywords: { $regex: this.queryStr.keyword, $options: "i" } },
              { category: { $regex: this.queryStr.keyword, $options: "i" } },
            ],
          }
        : {};
  
      this.query = this.query.find({ ...keyword });
      return this;
    }
  
    filter() {
      const queryCopy = { ...this.queryStr };
      // Removing some fields for category
      const removeFields = ["keyword", "page", "limit"];
    
      removeFields.forEach((key) => delete queryCopy[key]);
    
      // Handle minPrice separately
      if (queryCopy.minPrice) {
        queryCopy.price = { $gte: parseFloat(queryCopy.minPrice) };
        delete queryCopy.minPrice;
      }
    
      // Handle maxPrice separately
      if (queryCopy.maxPrice) {
        queryCopy.price = { ...queryCopy.price, $lte: parseFloat(queryCopy.maxPrice) };
        delete queryCopy.maxPrice;
      }

      // Handle minPrice separately
      if (queryCopy.minRating) {
        queryCopy.rating = { $gte: parseFloat(queryCopy.minRating) };
        delete queryCopy.minRating;
      }
    
      // Handle maxPrice separately
      if (queryCopy.maxRating) {
        queryCopy.rating = { ...queryCopy.price, $lte: parseFloat(queryCopy.maxRating) };
        delete queryCopy.maxRating;
      }
    
      // Filter For Price and Rating
      this.query = this.query.find(queryCopy);
    
      return this;
    }
    
    

    
    
    sort() {
      // if (this.queryStr.sort) {
      //   const sortBy = this.queryStr.sort.split(',').join(' ');
    
      //   try {
      //     // Try applying dynamic sorting
      //     this.query = this.query.sort(sortBy);
      //     console.log(this.query)
      //   } catch (error) {
      //     console.error('Sorting Error:', error.message);
      //   }
      // } else {
      //   // Default sorting logic if no sort parameter is provided
      //   this.query = this.query.sort({ createdAt: -1 }); // Sorting by createdAt in descending order
      // }
    
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
  