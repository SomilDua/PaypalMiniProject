//setup 
var express=require("express");
var app=express();
app.set("views","./views");
app.set("view engine","pug");
app.use(express.urlencoded({extended:true}));
app.use((req,res,next)=>{
	res.locals.appName="FFCS";
	next();
});
//var section
var authen=false;
var students=[];//list of students
var pass=[];//passwordfor the students
var courses=[];//course list
var times=[]//time slots for the courses
var count=[];//No of students in each coure
var reg=[];//Multidimesional array mapping students to courses
var busy_times=[];//array storing the busy slots for all students
var curr_student="";
//main section
app.get("/",function(req,res){
    res.redirect("/login");//Eachpage has its own handler this is done to simplify the program flow,pages can only redirect to other pages
});
app.get("/login",function(req,res){
    res.render("login");
});
app.post("/login",function(req,res){
    authen=false;
    if(req.body['Name']=="admin" && req.body['Password']=="admin"){//check if login is admin
        authen=true;
        res.redirect("/admin");
    }
    else if(students.indexOf(req.body['Name'])!=-1){//check if login is student
        if(req.body['Password']==pass[students.indexOf(req.body['Name'])]){
        curr_student=req.body['Name'];
        res.redirect("/student");
    }
    }
    else{
    res.render("login");//Redirect back to login if the login id or password is invalid
    }
});
app.get("/admin",function(req,res){//Handler for admin home page
    if(authen){
    res.render("admin",{courses:courses,no:count});//Displays all the courses and umber of student registered
    }
    else{
        res.redirect("login");//Redirect back if unauthenticated
    }
});
app.post("/admin",function(req,res){
    console.log(req.body);
});
app.get("/newstd",function(req,res){
    res.render("newstd");
});
//Handler to add student to the student list for the page /newtd
app.post("/newstd",function(req,res){
    students.push(req.body['regno']);
    pass.push(req.body['pass']);
    reg.push([]);
    busy_times.push([]);
    console.log(students);
    console.log(pass);
    console.log(reg);
    console.log(busy_times);
    res.render("newstd");
});
app.get("/delstd",function(req,res){
    res.render("delstd");
});
//Handler to delete student
app.post("/delstd",function(req,res){
    let temp=students.indexOf(req.body['regno']);
    if(temp!=-1){
    students.splice(temp,1);
    pass.splice(temp,1);
    reg.splice(temp,1);
    busy_times.splice(temp,1);
    }
    console.log(students);
    console.log(pass);
    console.log(reg);
    console.log(busy_times);
    res.redirect("/delstd");
});
app.get("/newcou",function(req,res){
    res.render("newcou");
});
//Handler to add a new course
app.post("/newcou",function(req,res){
    courses.push(req.body['courses']);
    times.push(req.body['times']);
    count.push(0);
    console.log(courses);
    console.log(times);
    console.log(count);
    res.render("newcou");
});
app.get("/delcou",function(req,res){
    res.render("delcou");
});
//Handler to delete course
app.post("/delcou",function(req,res){
    let temp=courses.indexOf(req.body['courses']);
    if(temp!=-1){
    courses.splice(temp,1);
    times.splice(temp,1);
    }
    console.log(courses);
    console.log(times);
    res.redirect("/delcou");
});
//Student portal Section
app.get("/student",function(req,res){
    res.render("student",{name:curr_student,reg_cou:reg[students.indexOf(curr_student)],busy:busy_times[students.indexOf(curr_student)]});
});
//Handler for course join
app.get("/joincou",function(req,res){
    let avail=[];
    let i=0;
    for(i=0;i<courses.length;i++){
        if(reg[students.indexOf(curr_student)].indexOf(courses[i])==-1){
            avail.push(courses[i]);
        }
    }
    res.render("joincou",{courses:avail});;
});
app.post("/joincou",function(req,res){
    let t1=students.indexOf(curr_student);//Get the index of logined course
    let t2=courses.indexOf(req.body['course']);//Get the index of selected curse
    if(t2>=0 && t1>=0){//if both the course and student exit
        if(busy_times[t1].indexOf(times[t2])==-1){//if student is free
            reg[t1].push(req.body['course']);//Add course to reg list
            busy_times[t1].push(times[t2]);//Add time slot ot busy list
            count[t2]+=1;
        }
    }
    console.log(t1);
    console.log(t2);
    console.log(busy_times[t1].indexOf(times[t2]));
    console.log(req.body['course']);
    console.log(reg);
    console.log(busy_times[t1]);
    console.log(count[t2]);
    res.redirect("/joincou");
});
app.get("/exitcou",function(req,res){
    res.render("exitcou",{joined:reg[students.indexOf(curr_student)]});;
});
app.post("/exitcou",function(req,res){
    let t1=students.indexOf(curr_student);//Get index of logged in student
    let temp=reg[t1].indexOf(req.body['course']);//get the index in registered courses for logged in student for the course 
    if(temp!=-1 && count[courses.indexOf(req.body['course'])]>5){//Allow exit only if course is joined and no of students>5
    reg[t1].splice(temp,1);//Remove course
    busy_times[t1].splice(temp,1);//Free time slot of the course
    count[courses.indexOf(req.body['course'])]-=1;//Remove one count from the reg courses
    }
    console.log(reg[t1]);
    console.log(busy_times[t1]);
    console.log(count);
    res.redirect("/exitcou");
});
app.listen(3000);
