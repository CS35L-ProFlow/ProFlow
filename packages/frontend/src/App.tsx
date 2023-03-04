import { useState } from 'react';
import { SignUp } from "./SignUp";
import ProjectView from './pages/ProjectView';
import UserView from './pages/UserView';
import LoginView from "./pages/LoginView";
import {
	BrowserRouter as Router,
	Routes,
	Route,
} from 'react-router-dom';
import Pages from "./pages"
import Client, { Session } from "./client";

const App = () => {
	const [client, _] = useState(new Client());
	const [projGuid, setProjGuid] = useState();
	const [session, setSession] = useState<Session | undefined>(undefined);

	return (
		<Router>
			<Routes>
				<Route path={Pages.HOME} element={<div></div>} />
				<Route path={Pages.SIGNUP} element={<SignUp client={client} onSignUp={setSession}/>} />
				<Route path={Pages.USER} element={<UserView session={session} setGuid={setProjGuid} />} />
				<Route path={Pages.LOGIN} element={<LoginView client={client} onLogin={setSession} />} />
				<Route path={projGuid} element={<ProjectView session={session} guid={projGuid}/>} />
			</Routes>
		</Router>
	)
}



export default App;
