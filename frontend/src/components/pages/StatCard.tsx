import { Card, CardContent, Box, Typography } from "@mui/material";

interface StatCardProps {
  label: string;
  value: number;
  gradient: string;
}

const cardSx = {
  height: "56px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: "4px",
  color: "white",
};

export default function StatCard({ label, value, gradient }: StatCardProps) {
  return (
    <Card
      sx={{
        ...cardSx,
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
  );
}
