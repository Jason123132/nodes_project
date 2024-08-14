const express = require('express');
const path = require('path');
const fs = require('fs');
const session = require('express-session');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: 'your_secret_key', // 替换为您的密钥
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

const loginFilePath = './login.txt'; 
const petsFilePath = './pets.json'; 


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

function getPets() {
    let pets = [];
    if (fs.existsSync(petsFilePath)) {
        const petsData = fs.readFileSync(petsFilePath, 'utf8');
        pets = JSON.parse(petsData);
    }
    return pets;
}


app.use(express.static(path.join(__dirname, 'public')));


app.get('/', (req, res) => {
    const { message, username } = req.query;
    const pets = getPets();
	
	console.log("Looking for view in:", path.join(__dirname, 'views', 'a3q8.ejs'));
	
    res.render('a3q8', { message: message || null, username: username || null, pets: pets });
});


app.post('/submit-pet', (req, res) => {
    const { petType, petName, petAge, petGender, petDescription, ownerName, ownerEmail } = req.body;
    const username = req.session.username; // 从 session 中获取用户名

    

    const newPet = { 
        petType, 
        petName, 
        petAge, 
        petGender, 
        petDescription, 
        ownerName, 
        ownerEmail,
        username 
    };

    // 存储宠物信息在 session 中
    if (!req.session.pets) {
        req.session.pets = [];
    }
    req.session.pets.push(newPet);

    	  res.redirect('/');
	/* 11*/
		/* 11*/
});

app.post('/have-pet', (req, res) => {
    const { petType, petName, petAge, petGender, petDescription, ownerName, ownerEmail } = req.body;
    const username = req.session.username; // 从 session 中获取用户名

    

    const newPet = { 
        petType, 
        petName, 
        petAge, 
        petGender, 
        petDescription, 
        ownerName, 
        ownerEmail,
        username 
    };

    // 存储宠物信息在 session 中
    if (!req.session.pets) {
        req.session.pets = [];
    }
    req.session.pets.push(newPet);

    	  res.redirect('/browse-my-pets');
	/* 11*/
		/* 11*/
});

app.post('/auth', (req, res) => {
    const { username, password } = req.body;
	
	   if (!/^[a-zA-Z0-9]+$/.test(username)) {
        res.end('Invalid username. A username can contain letters (both upper and lower case) and digits only.');
        return;
    }

    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{4,}$/.test(password)) {
        res.end('Invalid password. A password must be at least 4 characters long, have at least one letter and at least one digit.');
        return;
    }

    fs.readFile(loginFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send('Error reading login file.');
        }

        const users = data.split('\n').filter(line => line).map(line => line.split(':'));
        const user = users.find(([user, pass]) => user === username);

        if (user) {
           if (user[1] === password) {
                req.session.username = username; // 确保正确设置 session.username
                res.redirect(`/?message=Login successful.`);
            } else {
                res.redirect(`/?message=Invalid password.`);
            }
        } else {
            const newUserInfo = `${username}:${password}\n`;
            fs.appendFile(loginFilePath, newUserInfo, (err) => {
                if (err) {
                    return res.status(500).send('Error registering new user.');
                }
                req.session.username = username; // 确保正确设置 session.username
                res.redirect(`/?message=User registered successfully.`);
            });
        }
    });
});


app.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/?message=Logout failed.');
        }
        res.redirect('/?message=Logged out successfully.');
    });
});


app.get('/home', (req, res) => {
    res.render('a3q8', { message: null, username: null });  
});

app.get('/pets', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pets.html'));
});

app.get('/privacy', (req, res) => {
    res.send('Privacy and Disclaimer Statement'); 
});




app.get('/browse-my-pets', (req, res) => {
    if (!req.session.username) {
        return res.redirect('/?loginRequired=true');
    }

    const username = req.session.username;
    const pets = req.session.pets || [];
    res.render('browse_pets', { pets: pets.filter(pet => pet.username === username) });
});




app.get('/have-pet', (req, res) => {
	if (!req.session.username) {
        return res.redirect('/?loginRequired=true');
    }
    const username = req.query.username; 
    res.render('have_pet', { username });
});


const PORT = process.env.PORT || 8007;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});