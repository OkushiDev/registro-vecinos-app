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
import FolderIcon from "@mui/icons-material/Folder";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import CertificateIcon from "@mui/icons-material/Assignment";

export type UserProfile = "presidente" | "vecino";

interface NavbarProps {
  userProfile: UserProfile;
  onLogout: () => void;
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
    icon: <PeopleIcon />,
  },
  {
    label: "Registrar Vecino",
    path: "/presidente/registrar",
    icon: <PeopleIcon />,
  },
  { label: "Historial", path: "/presidente/historial", icon: <HistoryIcon /> },
];

const vecinoPages: NavItem[] = [
  {
    label: "Mis Antecedentes",
    path: "/vecino/antecedentes",
    icon: <FolderIcon />,
  },
  {
    label: "Subir Archivo",
    path: "/vecino/subir-archivo",
    icon: <UploadFileIcon />,
  },
  {
    label: "Solicitar Certificado",
    path: "/vecino/certificado",
    icon: <CertificateIcon />,
  },
];

const settings = ["Perfil", "Configuración", "Cerrar Sesión"];

export default function Navbar({
  userProfile,
  onLogout,
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

  return (
    <AppBar position="static">
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <HomeIcon sx={{ display: { xs: "none", md: "flex" }, mr: 1 }} />
          <Typography
            variant="h6"
            noWrap
            component="button"
            onClick={() => navigate("/")}
            sx={{
              mr: 2,
              display: { xs: "none", md: "flex" },
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".2rem",
              color: "inherit",
              textDecoration: "none",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            Junta Vecinos
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="menú de navegación"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: "block", md: "none" } }}
            >
              {pages.map((page) => (
                <MenuItem
                  key={page.path}
                  onClick={() => handleNavigation(page.path)}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {page.icon}
                    <Typography sx={{ textAlign: "center" }}>
                      {page.label}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          <HomeIcon sx={{ display: { xs: "flex", md: "none" }, mr: 1 }} />
          <Typography
            variant="h5"
            noWrap
            component="button"
            onClick={() => navigate("/")}
            sx={{
              mr: 2,
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
              fontFamily: "monospace",
              fontWeight: 700,
              letterSpacing: ".2rem",
              color: "inherit",
              textDecoration: "none",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            Junta Vecinos
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {pages.map((page) => (
              <Button
                key={page.path}
                onClick={() => handleNavigation(page.path)}
                startIcon={page.icon}
                sx={{
                  my: 2,
                  color: "white",
                  display: "flex",
                  backgroundColor:
                    location.pathname === page.path
                      ? "rgba(255,255,255,0.1)"
                      : "transparent",
                }}
              >
                {page.label}
              </Button>
            ))}
          </Box>

          <Box sx={{ flexGrow: 0 }}>
            <Tooltip title={getPageTitle()}>
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <Avatar
                  sx={{
                    bgcolor:
                      userProfile === "presidente"
                        ? "secondary.main"
                        : "primary.main",
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
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorElUser)}
              onClose={handleCloseUserMenu}
            >
              {settings.map((setting) => (
                <MenuItem
                  key={setting}
                  onClick={() => handleSettingClick(setting)}
                >
                  <Typography sx={{ textAlign: "center" }}>
                    {setting}
                  </Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
