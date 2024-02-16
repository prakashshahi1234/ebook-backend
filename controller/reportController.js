const catchAsyncErrors = require("../middleware/catchAsyncErrors"); // Import your catchAsyncErrors middleware
const Report = require('../model/report');
const ErrorHander = require("../utils/errorhandler");

// Create Report
exports.createReport = catchAsyncErrors(async (req, res, next) => {
  const {bookId} = req.params
  const { report } = req.body;
  const { id: reporter } = req.user;
   console.log(bookId, report,reporter)
  if (!bookId || !report) {
    return next(new ErrorHandler('Invalid Request', 401));
  }

  const newReport = await Report.create({ book: bookId, reporter, report });

  return res.status(201).json({ success: true, report: newReport });
});

// Update Review
exports.updatedReport = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const {id:resolvedBy} = req.user

  console.log(req.body)
  const updatedReport = await Report.findByIdAndUpdate(
    id,
    { ...req.body,resolvedBy},
    { new: true }
  );

  return res.status(200).json({ success: true, report: updatedReport });
});

// Get All Pending Reports with Book and User Details not only pending but all just name.
exports.getAllPendingReports = catchAsyncErrors(async (req, res, next) => {
  const {status} = req.query;
   console.log(status)
  const reports  = await Report.aggregate(
    [
      { $match: { status } },
      {
        $lookup: {
          from: 'books',
          localField: 'book',
          foreignField: '_id',
          as: 'bookDetails'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'reporter',
          foreignField: '_id',
          as: 'reporterDetails'
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'bookDetails.author',
          foreignField: '_id',
          as: 'author'
        }
      },
      { $unwind: { path: '$bookDetails' } },
      { $unwind: { path: '$reporterDetails' } },
      { $unwind: { path: '$author' } },
      {
        $project: {
          _id: 1,
          status: 1,
          report: 1,
          book: {
            _id: '$bookDetails._id',
            title: '$bookDetails.title',
            isSuspended:
              '$bookDetails.isSuspended.suspended',
            isDeleted:
              '$bookDetails.isDeleted.deleted',
            unPublished: '$bookDetails.unPublished'
          },
          reporter: {
            _id: '$reporterDetails._id',
            name: '$reporterDetails.email',
            email: '$reporterDetails.name',
            isVerified:
              '$reporterDetails.identityDetail.isVerified',
            isSuspended:
              '$reporterDetails.isSuspended.suspended',
              isDeleted:
              '$bookDetails.isDeleted.deleted',
          },
          author: {
            _id: '$author._id',
            name: '$author.email',
            email: '$author.name',
            isVerified:
              '$author.identityDetail.isVerified',
            isSuspended:
              '$author.isSuspended.suspended',
              isDeleted:
              '$bookDetails.isDeleted.deleted',
          },
          createdAt: 1,
          updatedAt: 1,
          isVisibleToAuthor:1
        }
      },
      { $sort: { createdAt: 1 } },
      { $limit: 20 }
    ],
    { maxTimeMS: 60000, allowDiskUse: true }
  );
 
  console.log(reports)

  return res.status(200).json({ success: true, reports: reports });

});




// Get All Reports Resolved Today
exports.getAllReportsResolvedToday = catchAsyncErrors(async (req, res, next) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set the time to the beginning of the day

  const reportsResolvedToday = await Report.find({
    resolvedBy: req.user.id,
    updatedAt: { $gte: today },
  });

  return res.status(200).json({ success: true, reports: reportsResolvedToday });
});
