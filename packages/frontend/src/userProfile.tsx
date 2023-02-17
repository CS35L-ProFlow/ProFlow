import Button from '@mui/material/Button'
import { ProFlow } from "./proflow/ProFlow";
import { ApiError } from "./proflow/core/ApiError";
import { BACKEND_PORT } from "./env";
import './App.css';
import './App.tsx'
import { deepStrictEqual } from 'assert';
import UserInfo from './components/userInfo';

const userPage = () => 
{
    return (<body>
        <div>
            <UserInfo name="Arty" description="That's me" organization='UCLA'></UserInfo>
        </div>
    </body>);
}

export default userPage;