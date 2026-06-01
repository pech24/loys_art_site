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
    { id: 'SKzz9W4H7usMnoPLGuBR', title: 'Tea at The Goblet', category: ArtworkCategory.FULL_ILLUSTRATION, order: 1, imageUrl: 'https://ik.imagekit.io/pcd7jjipb/Gallery/Aaron%20Commission.png?updatedAt=1776906077951' },
    { id: 'suTB1B1m4cVAeHlu7of9', title: 'Futures Rewritten', category: ArtworkCategory.FULL_ILLUSTRATION, order: 2, imageUrl: 'https://ik.imagekit.io/pcd7jjipb/Gallery/Bridget%20Commission%202.png?updatedAt=1776906076651' },
    { id: 'phwSOs5r52dKe5c8uqb4', title: 'Claws of Camaraderie', category: ArtworkCategory.FULL_ILLUSTRATION, order: 3, imageUrl: 'https://ik.imagekit.io/pcd7jjipb/Gallery/Absol%20Finished.png?updatedAt=1776906074798' },
    { id: 'R4FpwkcIjuNP56KUSwW1', title: 'Full Metal Mechanist', category: ArtworkCategory.FULL_ILLUSTRATION, order: 4, imageUrl: 'https://ik.imagekit.io/pcd7jjipb/Gallery/Shane%20Commission.png?updatedAt=1776906076782' },
    { id: 'WUKRejVhRFauum1v6440', title: 'Mage Exam', category: ArtworkCategory.FULL_ILLUSTRATION, order: 5, imageUrl: 'https://ik.imagekit.io/pcd7jjipb/Gallery/Aschente%202.png?updatedAt=1776906074640' },
    { id: 'B60sBf0SdwmFe3qf1Q0X', title: "Y'ahre", category: ArtworkCategory.PORTRAIT, order: 6, imageUrl: 'https://ik.imagekit.io/pcd7jjipb/Gallery/Y_ahre%202.png?updatedAt=1776906070079' },
    { id: 'q9w1KRRejLTa3gvDhRZK', title: 'Emiko', category: ArtworkCategory.PORTRAIT, order: 7, imageUrl: 'https://ik.imagekit.io/pcd7jjipb/Gallery/Emiko%202.png?updatedAt=1776906072315' },
    { id: 'JaYIUJRkDn36bl9TikQe', title: 'Loys Pichu', category: ArtworkCategory.PORTRAIT, order: 9, imageUrl: 'https://ik.imagekit.io/pcd7jjipb/Gallery/Deej%20Finished%202.png?updatedAt=1776906069759' },
    { id: 'qVC3jnFZAigx30rextNe', title: 'Ciel', category: ArtworkCategory.PORTRAIT, order: 10, imageUrl: 'https://ik.imagekit.io/pcd7jjipb/Gallery/Deej%20Finished%203.png?updatedAt=1776906070099' },
    { id: 'GpaqcuaHlv4udOya8B6d', title: 'Frost', category: ArtworkCategory.PORTRAIT, order: 11, imageUrl: 'https://ik.imagekit.io/pcd7jjipb/Gallery/Frost%20Commission%20Finished.png?updatedAt=1776906070367' },
    { id: 'rfK538B2v2ZEjA6Vml0J', title: 'Passing By', category: ArtworkCategory.PORTRAIT, order: 12, imageUrl: 'https://ik.imagekit.io/pcd7jjipb/Gallery/Roy%20Commission%202%20finished.png?updatedAt=1776906070066' },
    { id: 'PBAKZRLWCEjP4RpLNoe4', title: 'Bunkrap', category: ArtworkCategory.PORTRAIT, order: 13, imageUrl: 'https://ik.imagekit.io/pcd7jjipb/Gallery/Bunkrap%20Finished%202.png?updatedAt=1776906069803' },
    { id: 'YNm9EoYHCSEFQyiMl3pA', title: 'Tavern Glow', category: ArtworkCategory.PORTRAIT, order: 14, imageUrl: 'https://ik.imagekit.io/pcd7jjipb/Gallery/Ryan%20Commission.png?updatedAt=1776906074677' },
    { id: '9nDEeyj4J27XrwL5uFfK', title: 'Melancholy', category: ArtworkCategory.PORTRAIT, order: 16, imageUrl: 'https://ik.imagekit.io/pcd7jjipb/Gallery/Deej%20Finished.png?updatedAt=1776906070346' },
    { id: 'Y7VVt1qSuLUWN1jNFSLO', title: 'Fishers Intuition', category: ArtworkCategory.FULL_ILLUSTRATION, order: 17, imageUrl: 'https://ik.imagekit.io/pcd7jjipb/Gallery/1776099846696_Deej%20Fishing%20Commission.png?updatedAt=1776906076391' },
    { id: 'Y6506cziBYZdPQkczZ3E', title: 'Eternal Bonding', category: ArtworkCategory.FULL_ILLUSTRATION, order: 18, imageUrl: 'https://ik.imagekit.io/pcd7jjipb/Gallery/Wedding%201%20Finished.png?updatedAt=1776906076476' },
    { id: 'UmtHL10ZEJ1pAYMMtmO7', title: 'Doton', category: ArtworkCategory.FULL_ILLUSTRATION, order: 19, imageUrl: 'https://ik.imagekit.io/pcd7jjipb/Gallery/Aetherious%203rd%20finished.png?updatedAt=1776906078244' },
    { id: 'GnIv4TVu6M0hqTHnzyxp', title: 'Eternal Bonding 2', category: ArtworkCategory.PORTRAIT, order: 20, imageUrl: 'https://ik.imagekit.io/pcd7jjipb/Gallery/Wedding%202%20Main%20File.png?updatedAt=1776906076395' },
    { id: 'siHhjv1U7M7caGCsrMAN', title: 'Pink', category: ArtworkCategory.PORTRAIT, order: 21, imageUrl: 'https://ik.imagekit.io/pcd7jjipb/Gallery/Occult%20Finished.png?updatedAt=1776906070374' },
];
