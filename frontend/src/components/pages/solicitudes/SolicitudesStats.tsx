import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

interface SolicitudesStatsProps {
  total: number;
  pendientes: number;
  realizadas: number;
  rechazadas: number;
}

export default function SolicitudesStats({
  total,
  pendientes,
  realizadas,
  rechazadas,
}: SolicitudesStatsProps) {
  const cards: Array<[string, number, string]> = [
    ["Total", total, "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"],
    ["Pendientes", pendientes, "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"],
    ["Realizadas", realizadas, "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"],
    ["Rechazadas", rechazadas, "linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)"],
  ];

  return (
    <>
      {cards.map(([label, value, gradient]) => (
        <Card
          key={label}
          sx={{
            height: "56px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "4px",
            color: "white",
            background: gradient,
          }}
        >
          <CardContent sx={{ p: 1, "&:last-child": { pb: 1 } }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2" fontWeight="600">
                {label}:
              </Typography>
              <Typography variant="h6" fontWeight="bold">
                {value}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
