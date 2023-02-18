import './Project.css';
// import Button from '@mui/material/Button';
// import {useState} from 'react';

export interface ProjectData {
    // add an image to the interface to the user from API
    // avatar?: undefined;

    // name
    name: string;

    // role ?: string;

    // information
    // description: string;
}

export default function Project(props: ProjectData) {
    return (
        <div className="project-card">
            <div id="name-role">
                <h1>{props.name}</h1>
                {/* {props.role && <h3>Role: {props.role}</h3>} */}
            </div>
        </div>
    );
}