import { useLayoutEffect, useState } from "preact/hooks";
import { getUserDetailsApi } from "../api/auth";
import { createContainer } from "unstated-next";
import { ISignUp, ILoginResponse, UserDetails } from "@/api/interfaces/auth";
import { getConferenceStatus } from "@/api/conference";
import { IConferenceStatus } from "@/api/interfaces/conference";

const localStorageAccessKey = "access_token";
const localStorageRefreshKey = "refresh_token";
const localStorageUserKey = "user";
const localStorageConferenceKey = "conference";

const normalizeRoles = (roles: any): string[] => {
  if (!roles) return [];
  const rolesArray = Array.isArray(roles) ? roles : [roles];
  const normalized = rolesArray.map((role: any) => {
    if (typeof role === "string") return role.toUpperCase();
    if (typeof role === "number") {
      const mapping: Record<number, string> = {
        1: "SUPER_ADMIN",
        2: "PRACTICING_LAWYER",
        3: "ADMIN",
        4: "BAR_SERVICES",
        5: "BRANCH_ADMIN",
        6: "CONFERENCE_ADMIN",
      };
      return mapping[role] || "PRACTICING_LAWYER";
    }
    if (role && typeof role === "object") {
      return (
        role.name ||
        role.roleName ||
        role.role ||
        String(role.id || role)
      )
        .toString()
        .toUpperCase();
    }
    return String(role).toUpperCase();
  });

  // Remove duplicates and empty strings
  return [...new Set(normalized.filter((r) => !!r))];
};

function Context() {
  const [user, setUser] = useState(() => getUser());
  const [conferenceStatus, setConferenceStatus] = useState(
    getStoredConferenceStatus(),
  );
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.access_token,
  );

  const [signUpInfo, setSignUpInfo] = useState<ISignUp | undefined>();

  useLayoutEffect(() => {
    // get cached user
    setUser(getUser());
    // fetch user session from backend to replace cached user
    const getUserDetails = async () => {
      try {
        const [result, error] = await getUserDetailsApi();
        const [_res, _err] = await getConferenceStatus();
        if (error) {
          console.error("AuthContext: Failed to fetch user profile", error);
          return;
        }

        console.log("AuthContext: Raw profile result", result);
        const rawRoles =
          result?.roles ||
          result?.user?.roles ||
          result?.data?.roles ||
          result?.data?.user?.roles ||
          [];
        const userData = {
          ...(result?.data?.user || result?.user || result?.data || result),
          roles: normalizeRoles(rawRoles),
        };

        console.log("AuthContext: Normalized User", userData);
        setUser(userData);
        localStorage.setItem(localStorageUserKey, JSON.stringify(userData));
        if (!_err) {
          setConferenceStatus(_res);
          localStorage.setItem(localStorageConferenceKey, JSON.stringify(_res));
        }
      } catch (error: any) {
        console.error("AuthContext: Error in getUserDetails", error);
      }
    };
    if (isAuthenticated) {
      getUserDetails();
    }
  }, [isAuthenticated]);

  function getUser() {
    try {
      const storedUser = JSON.parse(localStorage.user || "{}");
      if (isAuthenticated && storedUser.roles) {
        return {
          ...storedUser,
          roles: normalizeRoles(storedUser.roles),
        };
      }
      return defaultUser;
    } catch (e) {
      return defaultUser;
    }
  }

  function getStoredConferenceStatus(): IConferenceStatus {
    try {
      const storedConferenceDetails = {
        ...JSON.parse(localStorage.conference),
      };
      if (isAuthenticated) {
        return storedConferenceDetails;
      }

      return defaultStatus;
    } catch (e) {
      return defaultStatus;
    }
  }

  function login(response: any) {
    console.log("AuthContext: Login response received", response);
    const accessToken =
      response.accessToken ||
      response.access_token ||
      response.data?.access_token;

    // Store access token only
    if (accessToken) {
      localStorage.setItem(localStorageAccessKey, accessToken);
    }

    // If response has user info, save it immediately
    const userPayload =
      response.user || response.data?.user || response.data || response;
    if (
      userPayload &&
      (userPayload.id || userPayload.email || userPayload.userId)
    ) {
      const rawRoles =
        userPayload.roles ||
        userPayload.user?.roles ||
        (userPayload.data && userPayload.data.roles) ||
        [];
      const normalizedUser = {
        ...(userPayload.user || userPayload.data || userPayload),
        roles: normalizeRoles(rawRoles),
      };
      console.log("AuthContext: Normalized login user", normalizedUser);
      setUser(normalizedUser);
      localStorage.setItem(localStorageUserKey, JSON.stringify(normalizedUser));
    }

    setIsAuthenticated(true);
  }

  function logout() {
    setIsAuthenticated(false);
    localStorage.removeItem(localStorageAccessKey);
    localStorage.removeItem(localStorageRefreshKey);
    localStorage.removeItem(localStorageUserKey);
    localStorage.removeItem(localStorageConferenceKey);
    window.location.reload();
  }

  const updateConferenceDetails = async () => {
    try {
      const [_res, _err] = await getConferenceStatus();
      if (_err) {
        // logout();
        return;
      }
      setConferenceStatus(_res);
      localStorage.setItem(localStorageConferenceKey, JSON.stringify(_res));
    } catch (error: any) {
      // logout();
    }
  };

  return {
    user,
    isAuthenticated,
    login,
    logout,
    signUpInfo,
    setSignUpInfo,
    conferenceStatus,
    setConferenceStatus,
    updateConferenceDetails,
  };
}

const defaultUser = {
  username: "",
  first_name: "",
  id: 0,
  last_name: "",
  middle_name: "",
  phone: "",
  roles: [],
  state_name: "",
  state_code: "",
  scn: "",
  is_honorable_bencher: false,
  is_san: false,
  is_profile_public: false,
  year_of_call: 0,
};

const defaultStatus: IConferenceStatus = {
  status: false,
  entry: null,
};

let AuthContext = createContainer(Context);

export default AuthContext;
