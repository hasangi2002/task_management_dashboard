const jwt = require("jsonwebtoken");

const Admin = require("../models/Admin");
const User = require("../models/User");
const Project = require("../models/Project");



const protect = async(req,res,next)=>{


    try{


        const authHeader = req.headers.authorization;



        if(!authHeader || !authHeader.startsWith("Bearer ")){

            return res.status(401).json({
                message:"No token provided"
            });

        }



        const token = authHeader.split(" ")[1];



        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );




        if(decoded.role==="admin"){


            const admin = await Admin.findById(decoded.id);



            if(!admin){

                return res.status(401).json({
                    message:"Admin not found"
                });

            }



            req.user={

                id:admin._id.toString(),

                role:"admin",

                name:admin.name,

                email:admin.email

            };



        }

        else{


            const member = await User.findById(decoded.id);



            if(!member){

                return res.status(401).json({
                    message:"Member not found"
                });

            }



            req.user={

                id:member._id.toString(),

                role:"member",

                name:member.name,

                email:member.email,

                projectId:
                member.project
                ? member.project.toString()
                : null

            };


        }



        next();



    }

    catch(error){


        console.log(error);


        return res.status(401).json({

            message:"Invalid or expired token"

        });


    }


};






const requireAdmin=(req,res,next)=>{


    if(req.user.role!=="admin"){

        return res.status(403).json({

            message:"Admin access required"

        });

    }


    next();


};





const requireProjectAccess=async(req,res,next)=>{


    try{


        const {projectId}=req.params;



        if(req.user.role==="admin"){



            const project =
            await Project.findById(projectId);



            if(!project){

                return res.status(404).json({

                    message:"Project not found"

                });

            }




            const allowed =
            project.admins.some(
                a=>a.toString()===req.user.id
            );




            if(!allowed){

                return res.status(403).json({

                    message:"You don't manage this project"

                });

            }



            req.project=project;


            next();



        }

        else{


            if(req.user.projectId!==projectId){


                return res.status(403).json({

                    message:"You don't belong to this project"

                });


            }



            next();


        }



    }

    catch(error){


        res.status(400).json({

            message:"Invalid project"

        });


    }


};




module.exports={
    protect,
    requireAdmin,
    requireProjectAccess
};