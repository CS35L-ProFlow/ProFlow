import './userInfo.css';
import Button from '@mui/material/Button';
import avatar from './sad-chair.jpg';

import {useState} from 'react';
import './Project.tsx';
import Project from './Project';

export interface UserData {
    // add an image to the interface to the user from API
    // avatar?: undefined;

    // name
    name: string;

    // information
    description: string;

}

export default function UserInfo(props: UserData) {
    const [projExp, setProjExp] = useState(true)
    const [following, setFollowing] = useState(false)
    const [contacts, setContacts] = useState(false)

    const handleProj = () => {
        setFollowing(false); 
        setProjExp(!projExp)
        setContacts(false);
    }

    const handleFollowing = () => {
        setFollowing(!following); 
        setProjExp(false);
        setContacts(false);
    }

    const handleContacts = () => {
        setFollowing(false);
        setProjExp(false);
        setContacts(!contacts);
    }

    return (
    <body className="body-of-page">
        <div className = "toppage">
            <div className = "main-user-info">
                <img alt="logo" src={avatar} className = "user-avatar-main"></img>
                <div className = "name-and-org">
                    <div className = "user-name-main">Name: {props.name}</div>
                </div>
                <div className = "user-description">{props.description}</div>
            </div>
            <div className = "buttons">
                <Button variant="outlined" sx={{color: "white", margin:2}} onClick={handleProj}>Projects</Button>
                <Button variant="outlined" sx={{color: "white", margin:2}} onClick={handleFollowing}>Following</Button>
                <Button variant="outlined" sx={{color: "white", margin:2}} onClick={handleContacts}>Contact</Button>
            </div>
        </div>
            {
                projExp &&
                <div className ="involved-projects">
                    <Project name="ProFlow"></Project>
                    <Project name="ProFlow"></Project>
                    <Project name="ProFlow"></Project>
                    <Project name="ProFlow"></Project>
                </div>
            }
            {
                following &&
                <div className ="involved-projects">
                    <Project name="ProFlow2"></Project>
                    <Project name="Google"></Project>
                </div>
            }
            {
                contacts &&
                <div className ="involved-projects">
                    <Project name="Email"></Project>
                </div>
            }
    </body>
    );
}