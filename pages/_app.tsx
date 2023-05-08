import { AppProps } from "next/app"
import Head from "next/head"
import { AppShell, ColorScheme, ColorSchemeProvider, MantineProvider, Center, Loader } from "@mantine/core"
import { Notifications } from "@mantine/notifications"
import "highlight.js/styles/stackoverflow-dark.css"
import { useChatStore } from "@/stores/ChatStore"
import Nav from "@/components/Nav"
import { useEffect, useState } from "react"
import UIController from "@/components/UIController"
import { setColorScheme } from "@/stores/ChatActions"

export default function App({ Component, pageProps }: AppProps) {
  const colorScheme = useChatStore((state) => state.colorScheme)

  const toggleColorScheme = (value?: ColorScheme) => {
    const nextColorScheme = value || (colorScheme === "dark" ? "light" : "dark")
    setColorScheme(nextColorScheme)
  }

  const apiKey = useChatStore((state) => state.apiKey);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => { setIsHydrated(true) }, [])

  if (!isHydrated) {
    return (
      <Center maw={400} h={100} mx="auto">
        <Loader color="gray" variant="bars" />
      </Center>
    )
  }

  return (
    <>
      <Head>
        <title>Flow ⚡️</title>
        <meta name="description" content="Flow ChatGPT UI" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
        <MantineProvider
          withGlobalStyles
          withNormalizeCSS
          theme={{
            /** Put your mantine theme override here */
            colorScheme,
            primaryColor: "bluu",
            colors: {
              // https://smart-swatch.netlify.app/#5E6AD2
              bluu: [
                "#e8edff",
                "#c2c8f3",
                "#9aa3e5",
                "#727ed9",
                "#4c59cd",
                "#3240b3",
                "#26318d",
                "#1a2366",
                "#0e1540",
                "#04061b",
              ],
              // https://smart-swatch.netlify.app/#2A2D3D
              dark: [
                "#eef1fd",
                "#d1d4e3",
                "#b3b7cb",
                "#959ab5",
                "#787e9f",
                "#5f6486",
                "#494e69",
                "#34384c",
                "#1e212f",
                "#070b16",
              ],
            },
          }}
        >
          <Notifications />
          <AppShell
            padding={0}
            navbar={<Nav />}
            layout="alt"
            navbarOffsetBreakpoint="sm"
            asideOffsetBreakpoint="sm"
            styles={(theme) => ({
              main: {
                backgroundColor:
                  theme.colorScheme === "dark"
                    ? theme.colors.dark[8]
                    : theme.colors.gray[0],
              },
            })}
          >
            <div style={{ position: "relative", height: "100%" }}>
              <Component {...pageProps} />

              {apiKey && <UIController />}
            </div>
          </AppShell>
        </MantineProvider>
      </ColorSchemeProvider>
    </>
  );
}
