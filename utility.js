function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function printUserInfo({id, name, role, city}){
   console.log(`Id: ${id}, Name: ${name}, Role: ${role}, City: ${city}`);
  }

  module.exports = { wait, printUserInfo };
