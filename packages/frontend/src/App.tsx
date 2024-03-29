import { useState } from 'react';
import { SignUp } from "./pages/SignUpView";
import ProjectView from './pages/ProjectView';
import UserView from './pages/UserView';
import LoginView from "./pages/LoginView";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
} from 'react-router-dom';
import Pages from "./pages"
import Client, { Session } from "./client";

const App = () => {
	const [client, _] = useState(new Client());
	const [session, setSession] = useState<Session | undefined>(undefined);

	return (
		<Router>
			<Routes>
				<Route path={Pages.SIGNUP} element={<SignUp client={client} onLogin={setSession} />} />
				<Route path={Pages.USER} element={<UserView session={session} onRefresh={setSession} />} />
				<Route path={Pages.LOGIN} element={<LoginView client={client} onLogin={setSession} />} />
				<Route path={Pages.PROJECT} element={<ProjectView session={session} onRefresh={setSession} />} />
				<Route path='*' element={<Navigate to={Pages.USER} />} />
			</Routes>
		</Router>
	)
}


export default App;
