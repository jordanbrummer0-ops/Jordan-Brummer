import { DeviceModel, Guide } from './types';

export const POPULAR_MODELS: DeviceModel[] = [
  { name: 'Redmi Note 12', code: 'topaz', chipset: 'Snapdragon' },
  { name: 'Redmi Note 11', code: 'spes', chipset: 'Snapdragon' },
  { name: 'Redmi 10', code: 'selene', chipset: 'MediaTek' },
  { name: 'Xiaomi 13 Pro', code: 'nuwa', chipset: 'Snapdragon' },
  { name: 'Redmi 9A', code: 'dandelion', chipset: 'MediaTek' },
  { name: 'Poco X3 Pro', code: 'vayu', chipset: 'Snapdragon' },
];

export const STATIC_GUIDES: Guide[] = [
  {
    id: 'guide-talkback-14',
    title: 'MIUI 14 TalkBack Method',
    miuiVersion: '14',
    difficulty: 'Medium',
    description: 'The standard TalkBack accessibility menu bypass for updated MIUI 14 devices.',
    updatedAt: '2024-05-10',
    steps: [
      { id: 1, text: 'Connect to a Wi-Fi network.' },
      { id: 2, text: 'Press Volume Up + Volume Down simultaneously to enable TalkBack.' },
      { id: 3, text: 'Draw an inverted "L" shape on the screen (Right then Up).' },
      { id: 4, text: 'Double tap "While using the app".' },
      { id: 5, text: 'Double tap "Use voice commands".' },
      { id: 6, text: 'Say "Open Google Assistant" clearly.' },
      { id: 7, text: 'When Assistant opens, say "Open Settings" or tap the keyboard icon to type it.' },
      { id: 8, text: 'Disable TalkBack (Vol Up + Vol Down).' },
      { id: 9, text: 'Navigate to Additional Settings > Accessibility > Accessibility Menu > Enable Shortcut.' },
      { id: 10, text: 'Go back to app list, find "Google Play Services" and clear data/disable if possible, or use the "Second Space" trick if available.' }
    ]
  },
  {
    id: 'guide-keyboard-13',
    title: 'MIUI 13 Keyboard Share',
    miuiVersion: '13',
    difficulty: 'Easy',
    description: 'Using the Xiaomi keyboard share bug to access settings.',
    updatedAt: '2023-11-20',
    steps: [
      { id: 1, text: 'Connect to Wi-Fi and proceed to the "Add Network" screen.' },
      { id: 2, text: 'Tap the text field to open the keyboard.' },
      { id: 3, text: 'Tap the icon in the keyboard toolbar that looks like a share button or a 4-square menu.' },
      { id: 4, text: 'Select "More" or the Settings gear.' },
      { id: 5, text: 'Find "About" or "Privacy Policy".' },
      { id: 6, text: 'Highlight text in the policy, tap "Share", and select "Gmail".' },
      { id: 7, text: 'Skip the Gmail setup, tap "Add an email address".' },
      { id: 8, text: 'Select "Exchange and Office 365".' },
      { id: 9, text: 'Enter any fake email, tap "Manual Setup", then "Exchange".' },
      { id: 10, text: 'Tap "Select" for Client Certificate to set a PIN/Pattern.' }
    ]
  },
  {
    id: 'guide-hyperos-e-sim',
    title: 'HyperOS Emergency SOS',
    miuiVersion: 'HyperOS',
    difficulty: 'Hard',
    description: 'Latest method for HyperOS involving emergency contacts.',
    updatedAt: '2024-08-15',
    steps: [
      { id: 1, text: 'Insert a SIM card with contacts saved.' },
      { id: 2, text: 'On the Welcome screen, tap "Emergency Call".' },
      { id: 3, text: 'Double tap "Emergency Information".' },
      { id: 4, text: 'Tap the pencil icon (edit) and add a contact.' },
      { id: 5, text: 'Tap the added contact, then tap the message icon.' },
      { id: 6, text: 'Type "www.youtube.com" and send it as SMS.' },
      { id: 7, text: 'Tap the link to open YouTube, then Settings > About > Terms of Service to open Chrome.' }
    ]
  }
];