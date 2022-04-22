const userModel = require("../models/userModel")
const aws = require("aws-sdk");

const bcrypt = require("bcryptjs")
const objectId = require('mongoose').Types.ObjectId
const jwt = require("jsonwebtoken")



/********************************88 */


const isValidObjId=/^[0-9a-fA-F]{24}$/

   const isValid = function (value) {
    if (typeof value == 'undefined' || value === null) return false
    if (typeof value == 'string' && value.trim().length === 0) return false
    return true
}

/************************************ */
aws.config.update(
    {
        accessKeyId: "AKIAY3L35MCRVFM24Q7U",
        secretAccessKey: "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",
        region: "ap-south-1"
    }
)


let uploadFile = async (file) => {
    return new Promise(function (resolve, reject) {

        let s3 = new aws.S3({ apiVersion: "2006-03-01" })

        var uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",
            Key: "group10/" + file.originalname,
            Body: file.buffer
        }
        console.log(uploadFile)
        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject({ "error": err })
            }

            return resolve(data.Location)
        }
        )

    }
    )
}


const createUSer = async function (req, res) {
    try {
        let data = req.body
        let files = req.files
        let address = JSON.parse(req.body.address)

        const { fname, lname, email, phone, password } = data

        if (files && files.length > 0) {
            profileImagessweetselfie = await uploadFile(files[0])
        }
       
        data.address = address

        if(!req.body.address){return res.send("address required")}
       

        if (Object.keys(data).length == 0)
            return res.status(400).send({ status: false, msg: "Please Enter some data" })

        if (!isValid(fname)) {
            return res.status(400).send({ status: false, msg: "fname is Required" })
        }

        if (!isValid(lname)) {
            return res.status(400).send({ status: false, msg: "lname is Required" })
        }

        if (!isValid(email)) {
            return res.status(400).send({ status: false, msg: "email is Required" })
        }

        if (isValid(email))
            if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(data.email)))
                return res.status(400).send({ status: false, msg: "is not a valid email" })

        let alreadyExistEmail = await userModel.findOne({ email: data.email })

        if (alreadyExistEmail) {
            return res.status(400).send({ status: false, msg: "email already exist" })
        }

        if (files.length==0) {
            return res.status(400).send({ status: false, msg: "ProfileImage is Required" })
        }

        if (!isValid(data.phone)) {
            return res.status(400).send({ status: false, msg: "phone is Required" })
        }

        const alreadyExsit = await userModel.findOne({ phone: data.phone })

        if (alreadyExsit) {
            return res.status(400).send({ status: false, msg: "phone already exit" })
        }

        if (!(/^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/.test(phone))) {
            return res.status(400).send({ status: false, message: "Mobile Number is not valid" })

        }

        if (!isValid(data.password)) {
            return res.status(400).send({ status: false, msg: "Password is Required" })
        }
        if (!isValid(password.trim())) { return res.status(400).send({ status: false, message: 'Please Provide Password' }) }

        if (!(password.length >= 8 && password.length <= 15)) { return res.status(400).send({ status: false, message: 'Please enter Password minlen 8 and maxlenth15' }) }


        if (!isValid(address.shipping.street)) {
            return res.status(400).send({ status: false, msg: "street is Required" })

        }
        
        if (!isValid(address.shipping.city)) {
            return res.status(400).send({ status: false, msg: "city is Required" })
        }
        if (!isValid(address.shipping.pincode)) {
            return res.status(400).send({ status: false, msg: "pincode is Required" })
        }
        if (!(/^([+]\d{2})?\d{6}$/.test(address.shipping.pincode)))
            return res.status(400).send({ status: false, msg: "Please Enter  a Valid pincode Number" })


        if (!isValid(address.billing.street)) {
            return res.status(400).send({ status: false, msg: "billing street is Required" })
        }
        if (!isValid(address.billing.city)) {
            return res.status(400).send({ status: false, msg: "billing city is Required" })
        }



        let hash = await bcrypt.hash(password, 10)

        const finalData = { fname, lname, email,profileImage:profileImagessweetselfie, phone, password: hash, address }
        

        const output = await userModel.create(finalData)

        return res.status(201).send({ message: "Success", data: output })
    }//address[shipping][street]
    catch (err) {
        console.log(err)
        return res.status(500).send({ msg: err.message })
    }
}

//.........................................login......................................

const logIn = async (req, res) => {
    try {
        let body = req.body
        if (!body)
            return res.status(400).send({ status: false, msg: "invalid request parameter, please provide login details" })

        const { email, password } = body

        if (isValid(email))
        if (!(/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email)))
            return res.status(400).send({ status: false, msg: "email is not a valid " })

        if (!isValid(email))
            return res.status(400).send({ status: false, msg: "please enter email" })

          

        if (!isValid(password))
            return res.status(400).send({ status: false, msg: "please enter password" })



        var input = await userModel.findOne({ email}) //password think about it

        if (!input)
            return res.status(404).send({ status: false, msg: "user not found please enter valid credentials" })

let pass = input.password

let check = await bcrypt.compare(password,pass)

if(!check){return res.status(400).send({status:false, msg: "password is incorrect"})}

        var token = jwt.sign({

            userId: input._id.toString(),

            group: "10",
            iat: Math.floor(Date.now() / 1000),          //payload
            exp: Math.floor(Date.now() / 1000) + 1 * 60 * 60    //1 hourds:minute:second

        }, "group10")//secret key
       
        res.setHeader("authorization", token) // look ion the postman body header


        return res.status(200).send({ status: true, msg: "user loing successfully", user:input._id, data: token })
    }
    catch (err) {
        return res.status(500).send({ status: false, msg: err.message })
    }

}




const getProfie = async function (req, res) {
    try {
        const data = req.params.userId

if(!objectId.isValid(data)){return res.status(400).send({status:false, msg:"please provide valid user ID"})}

        const getProfiileData = await userModel.findOne({ _id: data })

        if(!getProfiileData){return res.status(404).send({status:false, message: "Data not found"})}

        return res.status(200).send({status:true, data: getProfiileData})
    }
    catch (err) {
     
        return res.status(500).send({ msg: false, msg: err.message })
    }
}


const updateUser = async function (req, res) {
    try {
        let userid = req.params.userId  

        if(!objectId.isValid(userid)){return res.status(400).send({status:false, msg:"please provide valid user ID"})}

        let userFound = await userModel.findById(userid)
 
      
        if (!userFound) {
            return res.status(404).send({ status: false, message: 'no user exist with such user id' })
        }

        const userData = req.body
        const files = req.files

       if(!(userData && files)){return res.status(400).send({status: false, message: "please input some data"})}

   let newData = {}

        let { fname, lname, email, phone, password, address } = userData

        if (fname) {
            newData['fname']=fname
            if (!isValid(fname)) {
                { return res.status(400).send({ status: "false", message: "Please enter first name" }) }
            }
        }
        if (lname) {
            newData['lname']=lname
            if (!isValid(lname)) {
                { return res.status(400).send({ status: "false", message: "Please enter last name" }) }
            }
        }
        if (email) {

            newData['email']=email
            if (!isValid(email)) {
                { return res.status(400).send({ status: "false", message: "Please enter first name" }) }
            }

            if (!/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email)) {
                return res.status(400).send({ status: false, message: `Email should be a valid email address` });
            }
            let duplicateEmail = await userModel.findOne({ email: email })
            if (duplicateEmail) {
                return res.status(400).send({ status: false, message: `Email Already Exist` });
            }
        }
        if (phone) {

            newData['phone']=phone

            if (!isValid(phone)) {
                return res.status(400).send({ status: false, message: "Invalid request parameter, please provide Phone" });
            }
            if (!(/^(\+91[\-\s]?)?[0]?(91)?[789]\d{9}$/.test(phone))) {
                return res.status(400).send({ status: false, message: "Mobile Number is not valid" })
    
            }
            let duplicatePhone = await userModel.findOne({ phone: phone })
            if (duplicatePhone) {
                return res.status(400).send({ status: false, message: `Phone Number Already Present` });
            }
        }
        if (password) {
           
            if (!isValid(password)) { return res.status(400).send({ status: "false", message: "Please enter a valid password" }) }
            if (!(password.length >= 8 && password.length <= 15)) {
                return res.status(400).send({ status: false, message: "Password should be Valid min 8 and max 15 " });
            }
            var hash = bcrypt.hash(password, 10)
            newData['password']=hash
        }
        if (isValid(address)) {

            address = JSON.parse(address)

          if(isValid(address.shipping)){
              
              if(isValid(address.shipping.street)){
                newData['address.shipping.street']=address.shipping.street
              }

              if(isValid(address.shipping.city)){
                newData['address.shipping.city']=address.shipping.city
              }

              if(isValid(address.shipping.pincode)){
                newData['address.shipping.pincode']=address.shipping.pincode
              }
          }

          if(isValid(address.billing)){
              
            if(isValid(address.billing.street)){
              newData['address.billing.street']=address.billing.street
            }

            if(isValid(address.billing.city)){
              newData['address.billing.city']=address.billing.city
            }

            if(isValid(address.billing.pincode)){
              newData['address.billing.pincode']=address.billing.pincode
            }
        }
    }
      

            if (files.length > 0) {
                image = await uploadFile(files[0])
                newData.profileImage=image
            }
        
        const updatedUser = await userModel.findOneAndUpdate({ _id: userid },newData, { new: true })

        return res.status(200).send({ status: true, message: "user updated succesfully", data: updatedUser })
    }


    catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}







module.exports.createUSer = createUSer;
module.exports.logIn = logIn
module.exports.getProfie = getProfie
module.exports.updateUser = updateUser