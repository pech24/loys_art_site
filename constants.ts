import { CommissionTier, Artwork, ArtworkCategory } from './types';

export const navLinks = [
  { name: 'Home', path: '/' },
  { name: 'Gallery', path: '/gallery' },
  { name: 'Orders', path: '/orders' },
  { name: 'Waitlist', path: '/waitlist' },
  { name: 'Verify Art', path: '/verify' },
];

export const commissionTiers: CommissionTier[] = [
  {
    title: 'Head Portraits',
    price: 'Starts at 100 USD',
    description: 'A detailed illustration of your character from the chest up, ideal for icons and profile pictures.',
    imageUrl: 'https://cdn.loys.art/common/Webm/HeadPortrait.webm',
    features: ['1 Detailed Head Portrait', 'With Background', 'Free Minor Revisions', 'Timelapse and Certificate of Authenticity'],
  },
  {
    title: 'Full Illustration',
    price: 'Starts at 280 USD',
    description: 'A half-body illustration that allows for more expressive poses and character details.',
    imageUrl: 'https://cdn.loys.art/common/Webm/Full.webm',
    features: ['1 Whole Body Charater W/Armor & Weapon', 'Full Background', 'Free Minor Revisions', 'Timelapse and Certificate of Authenticity'],
  },
  {
    title: '30 Day Illustration',
    price: 'Starts at 1800 USD',
    description: 'A complete artwork of your character, capturing their full design in a dynamic pose.',
    imageUrl: 'https://cdn.loys.art/common/Webm/30days.webm',
    features: ['Hire me for 30 Days Straight', 'Commercial License Included', 'Free Major Revisions', 'Best for Bundle Commissions/ Group Illustrations'],
  },
];

export const commissionAddons = [
  { item: 'Extra Character', price: '+70% of base price' },
  { item: 'Complex Design', price: '+$10 to $30' },
  { item: 'Weapon', price: '+$15 to $25' },
  { item: 'Pets/Companions', price: '+$15 to $40' },
  { item: 'Detailed Background', price: '+$40 to $80+' },
];

export const commissionWillWont = {
  will: ['Final Fantasy XIV characters', 'Original Characters (OCs)', 'Fanart'],
  wont: ['NSFW / Hentai', 'Heavy Gore', 'Mecha / Complex Armor', 'Realism'],
};

export const commissionProcess = [
  { step: 'Inquiry', description: 'Answer commission form with your idea, character references, and any specific requests. You\'ll be sent the price quotation within 24 hrs.', imageUrl: 'https://cdn.loys.art/common/steps/Step1.png' },
  { step: 'Payment and Waitlist', description: 'After confirming details , I will send Paypal Invoice. Once payment is verified. You\'ll be listed on the waitlist. Client can request modifying commission details and references here.', imageUrl: 'https://cdn.loys.art/common/steps/Step2.png' },
  { step: 'Drawing and Revisions', description: 'After the waitlist your commission will be made. You\'ll receive Sketch/Lineart/Coloring update . Each with free minor revisions.', imageUrl: 'https://cdn.loys.art/common/steps/Step3.png' },
  { step: 'Final Delivery and Certificate', description: 'When the piece is complete . You\'ll receive an HD file copy through email. Certificate of Authenticity and Timelapse.', imageUrl: 'https://cdn.loys.art/common/steps/Step4.png' },
];

export const commissionTerms = [
  'All payments are via PayPal Invoice in USD.',
  'Full payment is required full upfront to enter waitlist.',
  'Commissions are for personal use only. Commercial use is +100% of the base price.',
  'Minor revisions are accepted during the sketch and coloring phases.',
  'Major revisions after the sketch phase may incur an extra fee.',
  'I reserve the right to decline any commission request.',
  'I retain the copyright of the artwork and the right to post it in my socials and portfolio unless discretion is agreed upon.',
  'No refunds are issued anytime.',
];

export const galleryArtworks: Artwork[] = [
    { 
      id: 1, 
      title: "Starlight Warrior", 
      category: ArtworkCategory.FULL_ILLUSTRATION, 
      imageUrl: 'https://picsum.photos/seed/ffxiv-warrior/800/1200'
    },
    { 
      id: 2, 
      title: "Ethereal Conjurer", 
      category: ArtworkCategory.PORTRAIT, 
      imageUrl: 'https://picsum.photos/seed/ffxiv-mage/800/1000'
    },
    { 
      id: 3, 
      title: "Gridanian Vista", 
      category: ArtworkCategory.FULL_ILLUSTRATION, 
      imageUrl: 'https://picsum.photos/seed/ffxiv-scene/1200/800'
    },
    { 
      id: 4, 
      title: "Chibi Dragoon", 
      category: ArtworkCategory.FULL_ILLUSTRATION, 
      imageUrl: 'https://picsum.photos/seed/ffxiv-chibi/800/800'
    },
    { 
      id: 5, 
      title: "Shadowbringer", 
      category: ArtworkCategory.FULL_ILLUSTRATION, 
      imageUrl: 'https://picsum.photos/seed/ffxiv-dark-knight/800/1200'
    },
    { 
      id: 6, 
      title: "Noble's Portrait", 
      category: ArtworkCategory.PORTRAIT, 
      imageUrl: 'https://picsum.photos/seed/anime-noble/800/1000'
    },
    { 
      id: 7, 
      title: "Limsa Lominsa Market", 
      category: ArtworkCategory.FULL_ILLUSTRATION, 
      imageUrl: 'https://picsum.photos/seed/fantasy-market/1200/800'
    },
    { 
      id: 8, 
      title: "Cosmic Voyager", 
      category: ArtworkCategory.FULL_ILLUSTRATION, 
      imageUrl: "https://picsum.photos/seed/anime-space/800/1200"
    },
    { 
      id: 9, 
      title: "Cute Summoner", 
      category: ArtworkCategory.FULL_ILLUSTRATION, 
      imageUrl: "https://picsum.photos/seed/chibi-mage/800/800"
    },
    { 
      id: 10, 
      title: "Samurai's Focus", 
      category: ArtworkCategory.PORTRAIT, 
      imageUrl: "https://picsum.photos/seed/anime-samurai/800/1000"
    },
    { 
      id: 11, 
      title: "Crystal Tower", 
      category: ArtworkCategory.FULL_ILLUSTRATION, 
      imageUrl: "https://picsum.photos/seed/fantasy-tower/1200/800"
    },
    { 
      id: 12, 
      title: "Steampunk Rebel", 
      category: ArtworkCategory.FULL_ILLUSTRATION, 
      imageUrl: "https://picsum.photos/seed/anime-steampunk/800/1200"
    },
];
