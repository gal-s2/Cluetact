const router = require('express').Router();

router.get('/login', (req, res) => {
    res.send(`
    <form>
        <button type="button" onclick="login()">Login</button>
    </form>
    <script>
        function login() {
            fetch('/user/login', { method: 'POST' })
                .then(response => response.text())
                .then(data => alert('Response: ' + data))
                .catch(error => console.error('Error:', error));
        }
    </script>
`);
});

router.post('/login', (req, res) => {
    console.log('Login clicked');
    res.status(200).send('Login successful');
})

module.exports = router;