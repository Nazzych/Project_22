import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

import { Layout } from '../components/layout/Layout';
import NotFound404 from '../components/PageNotFound';

import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { Dashboard } from '../pages/Dashboard';
import { Profile } from '../pages/Profile';
import { ChallengeList } from '../pages/ChallengeList';
import { CoursesList } from '../pages/CoursesList';
import { ProjectsHub } from '../pages/Projects';
import ProjectPage from '../pages/ProjectPage';
import { ITForum } from '../pages/ITForum';
import { ChannelPage } from '../pages/ChannelPage';
// import { AdminPanel } from '../pages/Administrator';
import AdminPanel from '../pages/admin/AdminPanel'
import { AdminRoute } from './ProtectedRoute';

export default function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Захищені маршрути */}
            <Route element={<ProtectedRoute />}>
                <Route element={<Layout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/challenges" element={<ChallengeList />} />
                    <Route path="/courses" element={<CoursesList />} />
                    <Route path="/projects" element={<ProjectsHub />} />
                    <Route path="/projects/:ownerId/:projectIdSlug" element={<ProjectPage />} />
                    <Route path="/forum" element={<ITForum />} />
                    <Route path="/forum/channel/:channelId/:name" element={<ChannelPage />} />

                    {/* Роут адміністратора */}
                    <Route element={<AdminRoute />}>
                        <Route path="/admin" element={<AdminPanel />} />
                    </Route>
                </Route>
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound404 />} />
        </Routes>
    );
}
