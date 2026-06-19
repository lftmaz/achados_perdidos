import { createContext, useState, useEffect, useContext } from 'react';
import {
  AuthenticationDetails,
  CognitoUser,
  CognitoUserAttribute,
  CognitoUserPool,
} from 'amazon-cognito-identity-js';

const AuthContext = createContext({});

const cognitoRegion = import.meta.env.VITE_COGNITO_REGION;
const cognitoClientId = import.meta.env.VITE_COGNITO_CLIENT_ID;
const cognitoUserPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID;
const cognitoAdminGroup = import.meta.env.VITE_COGNITO_ADMIN_GROUP || 'Admin';

const userPool = cognitoRegion && cognitoClientId && cognitoUserPoolId
  ? new CognitoUserPool({
      UserPoolId: cognitoUserPoolId,
      ClientId: cognitoClientId,
    })
  : null;

function decodeJwtPayload(token) {
  const payload = token.split('.')[1];
  if (!payload) {
    throw new Error('Token JWT inválido.');
  }

  const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const decoded = atob(padded);
  return JSON.parse(decoded);
}

function getUserFromToken(token) {
  const payload = decodeJwtPayload(token);
  const groups = payload['cognito:groups'] || [];

  const displayName = payload.email || payload.name || payload['cognito:username'] || payload.username || payload.sub || 'usuario';

  return {
    username: payload.username || payload['cognito:username'] || payload.email || payload.sub || 'usuario',
    displayName,
    groups,
    email: payload.email,
    sub: payload.sub,
  };
}

function getUserFromStoredTokens() {
  const idToken = localStorage.getItem('idToken');
  const accessToken = localStorage.getItem('accessToken');

  try {
    if (idToken) return getUserFromToken(idToken);
    if (accessToken) return getUserFromToken(accessToken);
  } catch (e) {
    console.warn('Erro ao decodificar token armazenado:', e);
  }

  return null;
}

function getCurrentCognitoUser(username) {
  if (!userPool) {
    throw new Error('Configure VITE_COGNITO_REGION, VITE_COGNITO_USER_POOL_ID e VITE_COGNITO_CLIENT_ID no arquivo .env.');
  }

  return new CognitoUser({
    Username: username,
    Pool: userPool,
  });
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // ----------------------------------------------------------------------
    // LOCAL 1: VERIFICAÇÃO DE SESSÃO DO COGNITO
    // Aqui você vai verificar se o usuário já tem um token JWT válido salvo 
    // no localStorage (ou cookies) e ler o payload para saber se ele é Admin.
    // ----------------------------------------------------------------------
    const storedUser = getUserFromStoredTokens();
    if (storedUser) {
      setUser(storedUser);
      setIsAdmin(storedUser.groups.includes(cognitoAdminGroup));
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    if (!userPool) {
      throw new Error('Configure VITE_COGNITO_REGION, VITE_COGNITO_USER_POOL_ID e VITE_COGNITO_CLIENT_ID no arquivo .env.');
    }

    const cognitoUser = getCurrentCognitoUser(username);
    const authenticationDetails = new AuthenticationDetails({
      Username: username,
      Password: password,
    });

    const session = await new Promise((resolve, reject) => {
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: resolve,
        onFailure: reject,
        newPasswordRequired: (userAttributes, requiredAttributes) => {
          reject(new Error(`New password required: ${JSON.stringify(requiredAttributes || userAttributes)}`));
        },
      });
    });

    const accessToken = session.getAccessToken().getJwtToken();
    const idToken = session.getIdToken().getJwtToken();
    const refreshToken = session.getRefreshToken().getToken();

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('idToken', idToken);
    localStorage.setItem('refreshToken', refreshToken);

    const currentUser = getUserFromStoredTokens() || getUserFromToken(accessToken);
    if (currentUser) {
      setUser(currentUser);
      setIsAdmin(currentUser.groups.includes(cognitoAdminGroup));
    }
  };

  const signUp = async (username, password, attributes = {}) => {
    if (!userPool) {
      throw new Error('Configure VITE_COGNITO_REGION, VITE_COGNITO_USER_POOL_ID e VITE_COGNITO_CLIENT_ID no arquivo .env.');
    }

    const attributeList = [
      new CognitoUserAttribute({ Name: 'email', Value: username }),
      ...(attributes.phoneNumber ? [new CognitoUserAttribute({ Name: 'phone_number', Value: attributes.phoneNumber })] : []),
      ...(attributes.name ? [new CognitoUserAttribute({ Name: 'name', Value: attributes.name })] : []),
    ];

    return await new Promise((resolve, reject) => {
      userPool.signUp(username, password, attributeList, null, (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      });
    });
  };

  const confirmSignUp = async (username, code) => {
    if (!userPool) {
      throw new Error('Configure VITE_COGNITO_REGION, VITE_COGNITO_USER_POOL_ID e VITE_COGNITO_CLIENT_ID no arquivo .env.');
    }

    const cognitoUser = getCurrentCognitoUser(username);

    return await new Promise((resolve, reject) => {
      cognitoUser.confirmRegistration(code, true, (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      });
    });
  };

  const resendSignUpCode = async (username) => {
    if (!userPool) {
      throw new Error('Configure VITE_COGNITO_REGION, VITE_COGNITO_USER_POOL_ID e VITE_COGNITO_CLIENT_ID no arquivo .env.');
    }

    const cognitoUser = getCurrentCognitoUser(username);

    return await new Promise((resolve, reject) => {
      cognitoUser.resendConfirmationCode((error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      });
    });
  };

  const logout = () => {
    // ----------------------------------------------------------------------
    // LOCAL 3: LOGOUT
    // Limpar os tokens do localStorage e resetar os estados.
    // ----------------------------------------------------------------------
    localStorage.removeItem('accessToken');
    localStorage.removeItem('idToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, login, signUp, confirmSignUp, resendSignUpCode, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
