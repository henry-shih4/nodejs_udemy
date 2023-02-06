const mongoose = require("mongoose");
const validator = require("validator");
const slugify = require("slugify");
const geoCoder = require("../utils/geocoder");

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Please enter job title"],
    trim: true,
    maxlength: [100, "Job title cannot exceed 100 characters"],
  },
  slug: String,
  description: {
    type: String,
    required: [true, "Please enter a job description"],
    maxlength: [1000, "Job description cannot exceed 1000 characters."],
  },
  email: {
    type: String,
    validate: [validator.isEmail, "Please enter a valid e-mail address"],
  },
  address: {
    type: String,
    required: [true, "Please enter an address"],
  },
  location: {
    type: {
      type: String,
      enum: ["Point"],
    },
    coordinates: {
      type: [Number],
      index: "2dsphere",
    },
    formattedAddress: String,
    city: String,
    state: String,
    zipcode: String,
    country: String,
  },
  company: {
    type: String,
    required: [true, "Please add a company name"],
  },
  industry: {
    type: [String],
    default: undefined,
    required: [true, "Please enter the industry of the job"],
    enum: {
      values: [
        "Business",
        "Information Technology",
        "Banking",
        "Education",
        "Human Resources",
        "Other",
      ],
      message: "Please select a valid option for industry",
    },
  },
  jobType: {
    type: String,
    required: [true, "Please enter a job type."],
    enum: {
      values: ["Full Time", "Contract", "Part Time", "Internship"],
      message: "Please select an option for job type",
    },
  },
  minEducation: {
    type: String,
    required: [true, "Please enter minimum education required for this job."],
    enum: {
      values: ["Bachelors", "Masters", "Phd"],
      message: "Please select an option for education",
    },
  },
  positions: {
    type: Number,
    default: 1,
  },
  experience: {
    type: String,
    required: [true, "Please enter experience required for this job."],
    enum: {
      values: [
        "No experience",
        "1 Year to 2 Years",
        "2 Years to 5 Years",
        "5 Years+",
      ],
      message: "Please select a correct option for experience.",
    },
  },
  salary: {
    type: Number,
    required: [true, "Please enter expected salary for this job."],
  },
  postingDate: {
    type: Date,
    default: Date.now,
  },
  lastDate: {
    type: Date,
    default: new Date().setDate(new Date().getDate() + 7),
  },
  appicantsApplied: {
    type: [Object],
    select: false,
  },
  postingUser: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
});

//creating job slug before saving to DB
jobSchema.pre("save", function (next) {
  this.slug = slugify(this.title, { lower: true });
  next();
});

//Setting up location

jobSchema.pre("save", async function (next) {
  const loc = await geoCoder.geocode(this.address);

  this.location = {
    type: "Point",
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddres: loc[0].formattedAddress,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode,
  };
  next();
});

module.exports = mongoose.model("Job", jobSchema);
