import Loader from '../../utils/Loader/index';
import { lazy } from 'react';

const LoginPage = Loader(lazy(() => import('../../views/auth/login/index')));

const AuthRoutes = {
    path: '/login',
    element: <LoginPage />,
};

export default AuthRoutes; 