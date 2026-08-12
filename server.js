const http = require('http');

const server = http.createServer((req, res) => {

    if(req.url === '/users') {
        // send users with 200
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({users: ["Gun", "Raj", "Priya"]}));
    } else {
        //send error with 404
        res.statusCode = 404;
        res.setHeader('Content-type', 'application/json');
        res.end(JSON.stringify({error: "User not found"}));
        
    }

});

server.listen(3000, () => {
console.log('Server is running on port 3000');
});