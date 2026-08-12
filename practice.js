//Task One: async/await + try/catch 

//function wait(ms) {
  //  return new Promise(resolve => setTimeout(resolve, ms));
//}

//Importing wait and printUserInfo function from utility
const {wait, printUserInfo } = require('./utility')

 async function fetchUsers(){
 console.log("start");
 await wait(1000);
 throw new Error("something went wrong");
 //console.log({id : 1, name: 'Tanmay', role: "SWE"});
   

try{
    await fetchUsers(); //(await)stay here, wait for this Promise to finish, and if it throws, you'll catch it."
}

catch(error){
    // console.error("Failed:", error.message);
 
  }
 }

  //Task two: Objects & Destructuring

//function printUserInfo({id, name, role, city}){
   //console.log(`Id: ${id}, Name: ${name}, Role: ${role}, City: ${city}`);
  //}
  
  //this is an object value we are passing as a argument 
  printUserInfo({id:1, name:"Gun", role: "admin", city: "Thane"});


  //Task Three: map & filter 
  //Do two things:
     //Use filter to get only active users
     //Use map on the filtered result to return only name and role — not the full object
      
     const users = [
    { id: 1, name: "Gun", role: "admin", active: true },
    { id: 2, name: "Raj", role: "user", active: false },
    { id: 3, name: "Priya", role: "user", active: true },
    { id: 4, name: "Sam", role: "admin", active: false },
];
//Task 1
// 'user' here represents each individual item as it loops
const activeUsers = users.filter(user => users.active === true);
//console.log(activeUsers);
//Task2
// 'user' represents each item, return a new object with just name and role
const onlySelected = activeUsers.map(user => ({name: users.name, role: users.role}));
//console.log(onlySelected);

//Fetch users with only role == "admin";
const adminRole = users.filter(user => users.role === "admin")
//console.log(adminRole); 



// Note the ({ }) — when returning an object directly from an arrow function you need to wrap it in parentheses, otherwise JS thinks the {} is a code block.

 



