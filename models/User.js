const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')

const AdminDB = require('../models/Admin')

const Schema = mongoose.Schema

const branches=['CSE', 'ECE','EEE','CE','ME'];

const UserSchema = new Schema({
      role:{
        type:String,
        enum:['admin','student','coadmin'],
        default:'student'
      },
	// co-admin to whom this student is assigend
	  coadminDetails: {
		  id: mongoose.Types.ObjectId,	// _id field of co-admin in AdminDB
		  name: String,
		  email: String
	  },
	  verified: {
		  type: Boolean,
		  default: false
	  },
	  paymentCompleted: {
		  type: Boolean,
		  default: false
	  },
      applicationNo:{
        type:String
      },
      course:{
        type:String,
        enum:{
          values:['MTech','BTech'],
          message:"Invalid course"
        },
      },
      quota:{
        enum:{
          values:['Management','Government','NRI'],//TODO
          message:"Invalid quota"
        },
        type:String
      },
      firstName:
        {
          type: String
        },
      middleName: String,
      lastName:
        {
          type: String,
          // required:['This field is required']
        },
      email:
        {
          type: String,
          validate:{
            validator: value=> /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)
          },
        },
      age :
      {
        type:Number,
        min:16,
        max:90,
      },
      aadhaar:
      {
        type: Number,
        validate: {
            validator:value=>/^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/.test(value),
            message:"Invalid Aadhar Number"
        },
      },
      countryCode:{
        type:String,
        default: '+91',

      },
      phone:
      {
        type:Number,
        validate:{
            validator:value=>/^[6-9]{1}[0-9]{9}$/.test(value),
            message:"Invalid Mobile Number"
        },
      },
      aPhone:
      {
        type:Number,
        validate:{
            validator:value=>/^[6-9]{1}[0-9]{9}$/.test(value),
            message:"Invalid Mobile Number"
        }
      },
      dob: Date,
      gender:
      {
        enum: {
            values: ['Male', 'Female','Others'],
            message:'Invalid Gender'
          },
        type:String
      },

      password:
      {
          type: String,
      },
      nationality:String,
      motherTongue:String,
      bloodGroup:
      {
        type:String,
        enum:{
            values:['O+','O-','A+','A-','B+','B-','AB+','AB-'],
            message:"Invalid Blood group"
        }
      },
      contactAddress:{
        addressL1:String,
        district:String,
        city:String,
        state:String,
        pincode:{
            type:Number,
            validate:{
                validator:value=>/^[1-9]{1}[0-9]{2}[0-9]{3}$/.test(value),
                message:'Invalid pincode'
            }
        }

      },
      permanentAddress:{
        addressL1:String,
        district:String,
        city:String,
        state:String,
        pincode:{
            type:Number,
            validate:{
                validator:value=>/^[1-9]{1}[0-9]{2}[0-9]{3}$/.test(value),
                message:'Invalid pincode'
            }
        }

      },
      fatherDetails: {
        name:String,
        occupation:String,
        mobile:{
            type:Number,
            validate:{
                validator:value=>/^[6-9]{1}[0-9]{9}$/.test(value),
                message:"Invalid Mobile Number"
            }
        },
        email:{
            type: String,
            validate:{
              validator: value=> /[a-z0-9]+@([a-z]+.)+[a-z]+/.test(value),
              message:"Invalid Email"
            },
          }
      },
      motherDetails: {
        name:String,
        occupation:String,
        mobile:{
            type:Number,
            validate:{
                validator:value=>/^[6-9]{1}[0-9]{9}$/.test(value),
                message:"Invalid Mobile Number"
            }
        },
        email:{
            type: String,
            validate:{
              validator: value=> /[a-z0-9]+@([a-z]+.)+[a-z]+/.test(value),
              message:"Invalid Email"
            },
          }
      },
      guardianDetails:{
        name:String,
        relation:String,
        occupation:String,
        mobile:{
            type:Number,
            validate:{
                validator:value=>/^[6-9]{1}[0-9]{9}$/.test(value),
                message:"Invalid Mobile Number"
            }
        },
        email:{
            type: String,
            validate:{
              validator: value=> /[a-z0-9]+@([a-z]+.)+[a-z]+/.test(value),
              message:"Invalid Email"
            },
          }
      },
      annualIncome:
      {
        type:Number,
      },
      NRIdetails: {
        name:String,
        relation:String
      },
      bp1:
      {
        enum: {
            values: branches,
            message:'Invalid Branch'
      },
      type:String
      },
      bp2:
      {
          enum: {
              values: branches,
              message:'Invalid Branch'
        },
        type:String
      },
      bp3:
      {
          enum: {
              values: branches,
              message:'Invalid Branch'
        },
        type:String
      },
      bp4:
      {
          enum: {
              values: branches,
              message:'Invalid Branch'
        },
        type:String
      },
      bp5:
      {
          enum: {
              values:branches,
              message:'Invalid Branch'
        },
        type:String
      },
      busFacility:{
        type:Boolean
      },
      hostelFacility:{
        type:Boolean
      },
      academicDetails:{
        qualifyingExam:String,
        phyMarkObtained:Number,
        phyMaxMarks:Number,
        chemMarkObtained:Number,
        chemMaxMarks:Number,
        mathsMarkObtained:Number,
        mathsMaxMarks:Number
      },
      filePhotograph:{
        type:String
      },
      imgSign:{
        type:String
      },
      fileTransactionID:{
        type:String
      },

      registrationTimeStamp : {
        type:Date,
        default: Date.now()
      },
      academicYear:{
        type:String
      },
      transactionID:{
        type:String
      },
      eligible:{
        
      }

});

UserSchema.methods.generateApplicationNo = function(number) {
  quota=this.quota.toString().toUpperCase()[0];
  course=this.course.toString().toUpperCase().slice(0,2);
  month=this.registrationTimeStamp.getMonth();
  year = this.registrationTimeStamp.getFullYear().toString().slice(2,);
  if(month > 9)
    year++;
  this.academicYear=year;
  applicationNo=(year*10000)+Number(number);
  this.applicationNo=quota+course+applicationNo;

}

UserSchema.methods.assignCoadmin = async function() {
	console.log('assignCoadmin()')
	console.log('calling AdminDB.getNextCoadmin()')
	const coadmin = await AdminDB.getNextCoadmin()
	console.log(`Next co-admin = ${coadmin}`)
	// increment studentsAssigned count in co-admin
	coadmin.studentsAssigned++
	coadmin.save()
	console.log(`updated coadmin: ${coadmin}`)
	// assign coadminID field in user, i.e coadmin._id field
	this.coadminDetails = {
		id: coadmin._id,
		name: coadmin.firstName,
		email: coadmin.email
	}
	console.log(`coadmin details: ${this.coadminDetails}`)
}

UserSchema.statics.studentCount = async function() {
	console.log('in studentCount()')
	const count = await this.countDocuments({role: 'student'})
	return count
}

UserSchema.methods.generatePassword = function(number) {
  dob=this.dob;
  date = dob.getDate().toString().padStart(2, '0');	// Pad with zeroes to make it atleast 2 digits
  month = (dob.getMonth()+1).toString().padStart(2, '0');
  year = dob.getFullYear().toString().slice(2,);
  applicationNo = this.applicationNo.match(/\d+/).toString()	// extract the number part from appNo

  password=date+month+applicationNo;
  return password;
}

UserSchema.methods.comparePassword = function(password) {
	return password == this.password;		// storing plaintext password. rip
}

UserSchema.methods.generateJWT = function() {
	let payload = {
		id:	this._id,
		email:	this.email,
		role:	this.role
	};

	return jwt.sign(payload, 'secret_key', {
		expiresIn: '24h'
	});
}

const User = mongoose.model('NRI', UserSchema)
module.exports = User


// course
// fname
// mName
// lName
// age
// aadhaar
// phone
// aPhone
// dob
// gender
// password
// nationality
// motherTongue
// bloodGroup
// addressL1C
// addressL2C
// cityC
// stateC
// pincodeC
// addressL1P
// addressL2P
// cityP
// stateP
// pincodeP
// fatherName
// fatherOccupation
// fatherMobile
// fatherEmail
// motherName
// motherOccupation
// motherMobile
// motherEmail
// guardianName
// guardianRelation
// guardianMobile
// guardianEmail
// annualIncome
// NRIname
// NRIrelation
// bp1
// bp2
// bp3
// bp4
// bp5
// busFacility
// hostelFacility
// qualifyingExam
// phyMarkObtained
// phyMaxMarks
// chemMarkObtained
// chemMaxMarks
// mathsMarkObtained
// mathsMaxMarks
// imgPhotograph
// imgSign
// quota
// countryCode
