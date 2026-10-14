import type { Preview } from "@storybook/react";
import { initialize, mswLoader } from "msw-storybook-addon";
import React from "react";
import "../src/app/globals.css";
import { handlers } from "../src/mocks/handlers";

initialize();

const withTheme = (Story: any, context: any) => {
  const theme = context.globals.theme ?? "light";
  React.useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);
  return React.createElement(
    "div",
    { className: theme === "dark" ? "dark" : "" },
    React.createElement(
      "div",
      { className: "bg-white p-4 dark:bg-gray-950 dark:text-gray-100" },
      React.createElement(Story)
    )
  );
};

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    msw: { handlers },
    a11y: { element: "#storybook-root" },
  },
  globalTypes: {
    theme: {
      description: "Global theme for components",
      defaultValue: "light",
      toolbar: {
        title: "Theme",
        icon: "circlehollow",
        items: ["light", "dark"],
        dynamicTitle: true,
      },
    },
  },
  decorators: [withTheme],
  loaders: [mswLoader],
};

export default preview;
