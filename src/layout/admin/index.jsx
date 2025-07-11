import React, { lazy, Suspense } from "react";
import PropTypes from "prop-types";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Drawer from "@mui/material/Drawer";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import { toast } from "react-toastify";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useAuth } from "../../contexts/AuthContext";
import { useNotification } from "../../contexts/NotificationContext";
import { useUser } from "../../contexts/UserContext";
import navigationAPI from "../../services/navigationAPI";

// Import components normally to avoid loading issues
import ConfirmationModal from "../../utils/Modal/ConfirmationModal";
import { renderIcon } from "../../utils/iconMapper.jsx";

function Branding() {
  return (
    <Box
      component="img"
      src={""}
      alt="SmartFee"
      sx={{ width: 120, mr: 2 }}
    />
  );
}

function DashboardLayoutAppBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const isMobile = useMediaQuery("(max-width:600px)");
  const { user, logout } = useAuth();
  const { showSuccess, showError } = useNotification();
  const { profile: userProfile } = useUser();

  const savedActiveItem = localStorage.getItem("activeItem") || "Dashboard";
  const [drawerOpen, setDrawerOpen] = React.useState(false); // Start collapsed by default
  const [activeItem, setActiveItem] = React.useState(savedActiveItem);
  const [isOpen, setIsOpen] = React.useState(false);
  const [navigationItems, setNavigationItems] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  // Set active item based on current URL
  React.useEffect(() => {
    const currentPath = location.pathname;
    const pathSegments = currentPath.split('/');
    
    // Check if we're in a settings sub-page
    if (currentPath.includes('/settings/')) {
      setActiveItem('Settings');
      localStorage.setItem("activeItem", 'Settings');
      return;
    }
    
    const lastSegment = pathSegments[pathSegments.length - 1];
    
    // Map URL segments to navigation labels
    const urlToLabelMap = {
      'dashboard': 'Dashboard',
      'users': 'Users',
      'students': 'Students',
      'fee-management': 'Fee Management',
      'fee-payment': 'Fee Payment',
      'transactions': 'Transactions',
      'notifications': 'Notifications',
      'audit-logs': 'Audit Logs',
      'settings': 'Settings'
    };
    
    const activeLabel = urlToLabelMap[lastSegment] || 'Dashboard';
    setActiveItem(activeLabel);
    localStorage.setItem("activeItem", activeLabel);
  }, [location.pathname]);

  // Fetch navigation items on component mount
  React.useEffect(() => {
    const fetchNavigation = async () => {
      try {
        const response = await navigationAPI.getSidebarNavigation();
        setNavigationItems(response.data.data.navigationItems);
      } catch (error) {
        console.error('Error fetching navigation:', error);
        showError('Failed to load navigation');
        // Fallback to default navigation
        setNavigationItems([
          { label: "Dashboard", route: "/dashboard", icon: "Dashboard" }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchNavigation();
  }, [showError]);

  const onClose = () => setIsOpen(false);

  const onConfirm = async () => {
    try {
      await logout();
        localStorage.removeItem("activeItem");
        localStorage.removeItem("role");
      // Set Dashboard as default for next login
      localStorage.setItem("activeItem", "Dashboard");
      showSuccess("Logged out successfully");
        navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
      showError("Error logging out");
    }
    setIsOpen(false);
  };

  const handleNavigation = (route, label) => {
    setActiveItem(label);
    localStorage.setItem("activeItem", label);
    const userId = user?.id || user?._id;
    navigate(`/dashboard/${userId}${route}`);
    if (isMobile) setDrawerOpen(false);
  };

  const toggleDrawer = () => setDrawerOpen((prev) => !prev);

  const drawerWidth = drawerOpen ? 240 : 70;

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <div>Loading...</div>
      </Box>
    );
  }

  return (
    <>
      <ConfirmationModal
        isOpen={isOpen}
        onClose={onClose}
        onConfirm={onConfirm}
        message={"You sure you want to log out?"}
      />

      {/* Custom Drawer with rounded corners and spacing - HIDDEN ON MOBILE */}
      <Box
        sx={{
          position: "fixed",
          top: 16,
          left: 16,
          bottom: 16,
          width: drawerWidth,
          zIndex: 2000,
          transition: "width 0.3s ease",
          display: { xs: "none", sm: "flex" }, // Hide on mobile (xs), show on small screens and up
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            backgroundColor: "#1a1a1a",
            borderRadius: "16px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
          }}
        >
          {/* Header with Logo and Hamburger */}
          <Box 
            sx={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: drawerOpen ? "space-between" : "center",
              p: 2,
              minHeight: 64,
              borderBottom: "1px solid #333"
            }}
          >
            {drawerOpen && (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    backgroundColor: "#3b82f6",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: "bold",
                    mr: 2
                  }}
                >
                  SF
                </Box>
                <span style={{ fontSize: "1.1rem", fontWeight: "600", color: "#fff" }}>SmartFee</span>
            </Box>
          )}
            
            <IconButton 
              onClick={toggleDrawer}
              sx={{ 
                color: "#fff",
                "&:hover": { backgroundColor: "#333" }
              }}
            >
              <MenuIcon />
            </IconButton>
          </Box>

          {/* Navigation Items */}
          <Box sx={{ padding: 1, flexGrow: 1 }}>
            {navigationItems.map((item) => {
              const isActive = activeItem === item.label;

              return (
                <Box
                  key={item.label}
                  onClick={() => handleNavigation(item.route, item.label)}
                  sx={{
                    backgroundColor: isActive ? "#3b82f6" : "transparent",
                    color: "#fff",
                    "&:hover": {
                      backgroundColor: isActive ? "#3b82f6" : "#333",
                    },
                    borderRadius: "8px",
                    marginY: "4px",
                    marginX: "4px",
                    minHeight: 48,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: drawerOpen ? "flex-start" : "center",
                    px: drawerOpen ? 2 : 0,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <Box 
                    sx={{ 
                      color: "#fff", 
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mr: drawerOpen ? 2 : 0,
                    }}
                  >
                    {renderIcon(item.icon)}
                  </Box>
                  {drawerOpen && (
                    <Box
                      sx={{ 
                        fontSize: "0.875rem",
                        fontWeight: 500,
                        color: "#fff"
                      }} 
                    >
                      {item.label}
                    </Box>
                  )}
                </Box>
              );
            })}
          </Box>

          {/* Logout Button */}
          <Box sx={{ padding: 1 }}>
            <Box
              onClick={() => setIsOpen(true)}
              sx={{
                color: "#fff",
                "&:hover": {
                  backgroundColor: "#333",
                },
                borderRadius: "8px",
                marginY: "4px",
                marginX: "4px",
                minHeight: 48,
                display: "flex",
                alignItems: "center",
                justifyContent: drawerOpen ? "flex-start" : "center",
                px: drawerOpen ? 2 : 0,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <Box 
                sx={{ 
                  color: "#fff", 
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mr: drawerOpen ? 2 : 0,
                }}
              >
                <LogoutIcon />
              </Box>
              {drawerOpen && (
                <Box
                  sx={{ 
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    color: "#fff"
                  }} 
                >
                  Logout
                </Box>
              )}
            </Box>
          </Box>
          </Box>
        </Box>

      {/* Mobile Drawer Overlay */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={drawerOpen}
          onClose={toggleDrawer}
          sx={{
            zIndex: 2001,
            "& .MuiDrawer-paper": {
              width: 240,
              backgroundColor: "#1a1a1a",
              color: "#fff",
            },
          }}
        >
          <Box sx={{ p: 2, borderBottom: "1px solid #333" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  backgroundColor: "#3b82f6",
                  borderRadius: "6px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "bold",
                  mr: 2
                }}
              >
                SF
              </Box>
              <span style={{ fontSize: "1.1rem", fontWeight: "600", color: "#fff" }}>SmartFee</span>
            </Box>
          </Box>
          
          <Box sx={{ padding: 1, flexGrow: 1 }}>
            {navigationItems.map((item) => {
              const isActive = activeItem === item.label;
            return (
              <ListItem
                button
                  key={item.label}
                  onClick={() => handleNavigation(item.route, item.label)}
                sx={{
                    backgroundColor: isActive ? "#3b82f6" : "transparent",
                    color: "#fff",
                  "&:hover": {
                      backgroundColor: isActive ? "#3b82f6" : "#333",
                  },
                  borderRadius: "8px",
                  marginY: "4px",
                    marginX: "8px",
                    minHeight: 48,
                    px: 2.5,
                }}
              >
                  <ListItemIcon sx={{ color: "#fff", minWidth: 0, mr: 3 }}>
                    {renderIcon(item.icon)}
                </ListItemIcon>
                  <ListItemText 
                    primary={item.label} 
                    sx={{ 
                      "& .MuiListItemText-primary": {
                        fontSize: "0.875rem",
                        fontWeight: 500
                      }
                    }} 
                  />
              </ListItem>
            );
          })}
          </Box>

          <Box sx={{ padding: 1 }}>
          <ListItem
            button
            onClick={() => setIsOpen(true)}
            sx={{
                color: "#fff",
                "&:hover": { backgroundColor: "#333" },
              borderRadius: "8px",
              marginY: "4px",
                marginX: "8px",
                minHeight: 48,
                px: 2.5,
            }}
          >
              <ListItemIcon sx={{ color: "#fff", minWidth: 0, mr: 3 }}>
              <LogoutIcon />
            </ListItemIcon>
              <ListItemText 
                primary="Logout" 
                sx={{ 
                  "& .MuiListItemText-primary": {
                    fontSize: "0.875rem",
                    fontWeight: 500
                  }
                }} 
              />
          </ListItem>
          </Box>
      </Drawer>
      )}

      <AppBar
        position="fixed"
        sx={{
          backgroundColor: "#fff",
          color: "#000",
          height: 64,
          zIndex: 30,
          left: { xs: 0, sm: drawerWidth + 32 }, // Mobile: full width, Desktop: account for sidebar
          width: { xs: "100%", sm: `calc(100% - ${drawerWidth + 32}px)` },
          transition: "left 0.3s ease, width 0.3s ease",
          boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
          top: { xs: 0, sm: 16 }, // Mobile: no top margin, Desktop: 16px margin
          right: { xs: 0, sm: 16 }, // Mobile: no right margin, Desktop: 16px margin
          borderRadius: { xs: 0, sm: "12px" }, // Mobile: no border radius, Desktop: rounded
          mr: { xs: 0, sm: 2 },
        }}
      >
        <Toolbar>
          {isMobile && (
            <IconButton 
              edge="start" 
              aria-label="menu" 
              onClick={toggleDrawer}
              sx={{ mr: 2 }}
            >
              <MenuIcon sx={{ color: "#000" }} />
            </IconButton>
          )}
          
          {/* Page Title */}
          <Box sx={{ flexGrow: 1 }}>
            <span style={{ fontSize: "1.25rem", fontWeight: "600", color: "#1f2937" }}>
              {activeItem}
            </span>
          </Box>
          
          {/* User Info */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: userProfile?.profilePicture ? 'transparent' : '#3b82f6',
                backgroundImage: userProfile?.profilePicture ? `url(${userProfile.profilePicture})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '0.875rem',
                fontWeight: 'bold',
                border: userProfile?.profilePicture ? '2px solid #e5e7eb' : 'none',
              }}
            >
              {!userProfile?.profilePicture && (
                <>
                  {(userProfile?.firstName || user?.firstName)?.charAt(0)}
                  {(userProfile?.lastName || user?.lastName)?.charAt(0)}
                </>
              )}
            </Box>
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1f2937' }}>
                {userProfile?.firstName || user?.firstName} {userProfile?.lastName || user?.lastName}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                {userProfile?.role === 'super_admin' 
                  ? 'Super Admin' 
                  : userProfile?.role === 'admin' 
                    ? 'Admin' 
                    : userProfile?.role === 'accountant'
                      ? 'Accountant'
                      : userProfile?.role === 'student'
                        ? `Student ${userProfile?.studentId ? `(${userProfile.studentId})` : ''}`
                        : (user?.role === 'super_admin' ? 'Super Admin' : user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1))
                }
              </div>
              {userProfile?.department && (
                <div style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                  {userProfile.department}
                </div>
              )}
            </Box>
          </Box>
        </Toolbar>
      </AppBar>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: { xs: 8, sm: 10 }, // Mobile: account for standard app bar, Desktop: account for rounded app bar
          ml: { xs: 0, sm: `${drawerWidth + 32}px` }, // Mobile: no left margin, Desktop: account for sidebar + spacing
          mr: { xs: 0, sm: 2 },
          transition: "margin-left 0.3s ease",
          backgroundColor: "#f9fafb",
          minHeight: { xs: "calc(100vh - 64px)", sm: "calc(100vh - 80px)" }, // Mobile: standard height, Desktop: account for margins
          borderRadius: { xs: 0, sm: "12px" }, // Mobile: no border radius, Desktop: rounded
        }}
      >
        <Outlet />
      </Box>
    </>
  );
}

DashboardLayoutAppBar.propTypes = {
  children: PropTypes.node,
};

export default DashboardLayoutAppBar;
