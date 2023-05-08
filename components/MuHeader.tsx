import { useRouter } from 'next/router'
import { useMediaQuery } from '@mantine/hooks'
import { useChatStore } from '@/stores/ChatStore'
import { addChat, setNavOpened } from '@/stores/ChatActions'
import { createStyles, Header, Group, ActionIcon, Container, Burger, rem, Text, MediaQuery, Divider, px } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { useSpeechSynthesis } from '../lib/useSpeechSynthesis'

const useStyles = createStyles((theme) => ({
  inner: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: rem(36),

    [theme.fn.smallerThan('sm')]: {
      justifyContent: 'flex-start'
    }
  },

  links: {
    width: rem(260),

    [theme.fn.smallerThan('sm')]: {
      display: 'none'
    }
  },

  social: {
    width: rem(260),

    [theme.fn.smallerThan('sm')]: {
      width: 'auto',
      marginLeft: 'auto'
    }
  },

  burger: {
    marginRight: theme.spacing.md,

    [theme.fn.largerThan('sm')]: {
      display: 'none'
    }
  },

  link: {
    display: 'block',
    lineHeight: 1,
    padding: `${rem(8)} ${rem(12)}`,
    borderRadius: theme.radius.sm,
    textDecoration: 'none',
    color:
      theme.colorScheme === 'dark'
        ? theme.colors.dark[0]
        : theme.colors.gray[7],
    fontSize: theme.fontSizes.sm,
    fontWeight: 500,

    '&:hover': {
      backgroundColor:
        theme.colorScheme === 'dark'
          ? theme.colors.dark[6]
          : theme.colors.gray[0]
    }
  },

  linkActive: {
    '&, &:hover': {
      backgroundColor: theme.fn.variant({
        variant: 'light',
        color: theme.primaryColor
      }).background,
      color: theme.fn.variant({ variant: 'light', color: theme.primaryColor })
        .color
    }
  }
}))

export default function MuHeader () {
  const { classes, theme } = useStyles()
  const { voices } = useSpeechSynthesis() as { voices: SpeechSynthesisVoice[] }
  const router = useRouter()
  const isMobileDevice = useMediaQuery(`(max-width: ${theme.breakpoints.sm})`)
  const chats = useChatStore((state) => state.chats)
  const settings = useChatStore((state) => state.settingsForm)
  const navOpened = useChatStore((state) => state.navOpened)
  const activeChat = chats.find((chat) => chat.id === router.query.chatId)

  return (
    <Header height={36} mb={120} sx={{ zIndex: 1002 }}>
      <Container className={classes.inner}>
        <MediaQuery largerThan='sm' styles={{ display: 'none', width: 0 }}>
          <Burger opened={navOpened} onClick={() => setNavOpened(!navOpened)} size='sm' color={theme.colors.gray[6]} />
        </MediaQuery>
        <MediaQuery largerThan='sm' styles={{ width: '100%', justifyContent: 'center' }}>
          <Group spacing={5} className={classes.social} noWrap c='dimmed'>
            {
              activeChat?.chosenCharacter && (
                <>
                  <MediaQuery smallerThan='md' styles={{ display: 'none' }}>
                    <Text size='sm'>{activeChat?.chosenCharacter}</Text>
                  </MediaQuery>
                  <MediaQuery smallerThan='md' styles={{ display: 'none' }}>
                    <Divider size='xs' orientation='vertical' />
                  </MediaQuery>
                </>
              )
            }
            <Text size='sm'>{ settings?.model }</Text>
            <>
              <Divider size='xs' orientation='vertical' />
              <Text size='sm'>${( activeChat?.costIncurred || 0).toFixed(2) }</Text>
            </>
            <>
              <Divider size='xs' orientation='vertical' />
              <Text size='sm'>
                { settings.voice || voices?.find(voice => voice?.default)?.voiceURI || 'system' }
              </Text>
            </>
          </Group>
        </MediaQuery>
        <Group position='right' spacing={ 0} className={ classes.social } noWrap>
          <MediaQuery largerThan='sm' styles={{ display: 'none', width: 0 }}>
            <ActionIcon size='lg' onClick={() => {
              addChat(router)
              if (isMobileDevice) setNavOpened(false)
            }}>
              <IconPlus size={px('1.5rem')} stroke={1.5} color={theme.colors.gray[6]} />
            </ActionIcon>
          </MediaQuery>
        </Group>
      </Container>
    </Header>
  )
}
