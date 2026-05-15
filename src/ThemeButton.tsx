import { MoonIcon, SunIcon } from "@primer/octicons-react";
import { useTheme } from "next-themes";
import type { ComponentProps } from "react";
import { Button } from "@/components/ui/Button";

export function ThemeButton({ ...props }: ComponentProps<typeof Button>) {
  const { resolvedTheme, setTheme } = useTheme();
  const toggleTheme = () => {
    setTheme(resolvedTheme === "light" ? "dark" : "light");
  };
  return (
    <Button variant="quiet" onPress={toggleTheme} {...props}>
      {resolvedTheme === "dark" ? <MoonIcon /> : <SunIcon />}
    </Button>
  );
}
