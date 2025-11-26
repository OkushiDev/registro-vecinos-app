import * as React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import HistoryIcon from "@mui/icons-material/History";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CertificateIcon from "@mui/icons-material/Assignment";
import PersonIcon from "@mui/icons-material/Person";

// 1. IMPORTAMOS LOS ICONOS DE TEMA
import Brightness4Icon from "@mui/icons-material/Brightness4"; // Luna
import Brightness7Icon from "@mui/icons-material/Brightness7"; // Sol

export type UserProfile = "presidente" | "vecino";

interface NavbarProps {
  userProfile: UserProfile;
  onLogout: () => void;
  // 2. AGREGAMOS LAS PROPS PARA EL TEMA
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactElement;
}

const presidentePages: NavItem[] = [
  {
    label: "Lista de Vecinos",
    path: "/presidente/vecinos",
    icon: <PeopleIcon fontSize="small" />,
  },
  {
    label: "Documentos",
    path: "/presidente/documentos",
    icon: <PeopleIcon fontSize="small" />,
  },
  {
    label: "Historial",
    path: "/presidente/historial",
    icon: <HistoryIcon fontSize="small" />,
  },
];

const vecinoPages: NavItem[] = [
  {
    label: "Antecedentes",
    path: "/vecino/antecedentes-vecino",
    icon: <PersonIcon fontSize="small" />,
  },
  {
    label: "Subir Archivo",
    path: "/vecino/subir-archivo",
    icon: <UploadFileIcon fontSize="small" />,
  },
  {
    label: "Certificado",
    path: "/vecino/certificado",
    icon: <CertificateIcon fontSize="small" />,
  },
];

const settings = ["Perfil", "Configuración", "Cerrar Sesión"];

export default function Navbar({
  userProfile,
  onLogout,
  isDarkMode, // Recibimos prop
  onToggleTheme, // Recibimos prop
}: NavbarProps): React.ReactElement {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null
  );
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null
  );
  const navigate = useNavigate();
  const location = useLocation();

  const pages = userProfile === "presidente" ? presidentePages : vecinoPages;

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    handleCloseNavMenu();
  };

  const handleSettingClick = (setting: string) => {
    if (setting === "Cerrar Sesión") {
      onLogout();
    }
    handleCloseUserMenu();
  };

  const getPageTitle = () => {
    return userProfile === "presidente" ? "Panel Presidente" : "Panel Vecino";
  };

  // Definimos colores dinámicos basados en el tema para el Navbar flotante
  const navBgColor = isDarkMode
    ? "rgba(3, 14, 29, 0.85)"
    : "rgba(255, 255, 255, 0.85)";
  const navTextColor = isDarkMode ? "white" : "#1e293b";
  const navBorderColor = isDarkMode
    ? "rgba(255, 255, 255, 0.08)"
    : "rgba(0, 0, 0, 0.08)";

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          top: 16,
          left: 0,
          right: 0,
          width: "auto",
          maxWidth: "1200px",
          mx: "auto",
          borderRadius: "999px",
          bgcolor: navBgColor,
          color: navTextColor,
          backdropFilter: "blur(24px)",
          border: `1px solid ${navBorderColor}`,
          boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
          transition: "all 0.3s ease",
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ minHeight: "64px" }}>
            {/* LOGO DESKTOP */}
            <Typography
              variant="h6"
              noWrap
              component="button"
              onClick={() => navigate("/")}
              sx={{
                mr: 4,
                display: { xs: "none", md: "flex" },
                fontWeight: 700,
                color: "inherit",
                textDecoration: "none",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "1.1rem",
              }}
            >
              Villa Florencia
            </Typography>

            {/* MENU MOBILE (HAMBURGER) */}
            <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
              <IconButton
                size="large"
                aria-label="menú de navegación"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                keepMounted
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{ display: { xs: "block", md: "none" } }}
                PaperProps={{
                  sx: {
                    bgcolor: isDarkMode ? "#0a1929" : "white",
                    color: isDarkMode ? "white" : "black",
                  },
                }}
              >
                {pages.map((page) => (
                  <MenuItem
                    key={page.path}
                    onClick={() => handleNavigation(page.path)}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      {page.icon}
                      <Typography textAlign="center">{page.label}</Typography>
                    </Box>
                  </MenuItem>
                ))}
              </Menu>
            </Box>

            {/* LOGO MOBILE */}
            <HomeIcon
              sx={{
                display: { xs: "flex", md: "none" },
                mr: 1,
                color: "#66b2ff",
              }}
            />
            <Typography
              variant="h5"
              noWrap
              component="button"
              onClick={() => navigate("/")}
              sx={{
                mr: 2,
                display: { xs: "flex", md: "none" },
                flexGrow: 1,
                fontWeight: 700,
                color: "inherit",
                textDecoration: "none",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              Vecinos
            </Typography>

            {/* LINKS DESKTOP */}
            <Box
              sx={{ flexGrow: 1, display: { xs: "none", md: "flex" }, gap: 1 }}
            >
              {pages.map((page) => (
                <Button
                  key={page.path}
                  onClick={() => handleNavigation(page.path)}
                  sx={{
                    my: 2,
                    color: "inherit",
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: 500,
                    textTransform: "none",
                    borderRadius: "20px",
                    px: 2,
                    backgroundColor:
                      location.pathname === page.path
                        ? isDarkMode
                          ? "rgba(255,255,255,0.1)"
                          : "rgba(0,0,0,0.05)"
                        : "transparent",
                    "&:hover": {
                      backgroundColor: isDarkMode
                        ? "rgba(255,255,255,0.05)"
                        : "rgba(0,0,0,0.04)",
                    },
                  }}
                >
                  {page.label}
                </Button>
              ))}
            </Box>

            {/* === 3. BOTÓN DE CAMBIO DE TEMA === */}
            <Tooltip
              title={
                isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
              }
            >
              <IconButton
                onClick={onToggleTheme}
                color="inherit"
                sx={{ ml: 1, mr: 1 }}
              >
                {isDarkMode ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>

            {/* AVATAR / PERFIL */}
            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title={getPageTitle()}>
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor:
                        userProfile === "presidente" ? "#9c27b0" : "#0288d1",
                      border: `2px solid ${
                        isDarkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"
                      }`,
                    }}
                  >
                    {userProfile === "presidente" ? "P" : "V"}
                  </Avatar>
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: "45px" }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                keepMounted
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {settings.map((setting) => (
                  <MenuItem
                    key={setting}
                    onClick={() => handleSettingClick(setting)}
                  >
                    <Typography textAlign="center">{setting}</Typography>
                  </MenuItem>
                ))}
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Espaciador invisible */}
      <Box
        sx={{ height: "100px", width: "100%", display: "block" }}
        aria-hidden="true"
      />
    </>
  );
}
