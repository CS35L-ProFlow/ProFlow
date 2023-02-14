export function Sign_Up() {
    return(
        <div>
            <h1>Welcome!</h1>
            <h2>Enter your new account information below:</h2>
            <div>Email:</div>
            <input id="email" type="text"/>
            <div>Password</div>
            <input id="password" type="text" />
            <div/>
            <button onClick={() => {
                const email_input = (document.getElementById('email') as HTMLInputElement).value;
                console.log("Email: " + email_input);
                }}>Print Email</button>
            <div></div>
            <button onClick={() => {
                const email_input = (document.getElementById('password') as HTMLInputElement).value;
                console.log("Password: " + email_input);
                }}>Print Password</button>
            <div></div>
			<button onClick={() => window.open("https://google.com")}>Invite Friends</button>
		</div>	
    );
}