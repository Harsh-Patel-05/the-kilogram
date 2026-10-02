import logoMark from '../assets/logo/logo-mark.webp';
import logoWordmark from '../assets/logo/logo-wordmark.webp';
import './BrandLockup.css';

/** Horizontal arrangement of the official logo artwork for tight spaces (header, menus). */
export default function BrandLockup({ className = '' }) {
  return (
    <span className={`lockup ${className}`}>
      <img className="lockup__mark" src={logoMark} alt="" width="414" height="272" />
      <img className="lockup__word" src={logoWordmark} alt="The Kilogram" width="397" height="49" />
    </span>
  );
}
