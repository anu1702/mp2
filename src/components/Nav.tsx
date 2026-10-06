import { NavLink } from 'react-router-dom'
import styles from './Nav.module.css'

function linkClass(isActive: boolean): string {
  return isActive ? `${styles.link} ${styles.active}` : styles.link
}

export default function Nav() {
  return (
    <nav className={styles.nav} aria-label="Primary">
      <NavLink to="/" end className={({ isActive }) => linkClass(isActive)}>
        List
      </NavLink>
      <NavLink to="/gallery" className={({ isActive }) => linkClass(isActive)}>
        Gallery
      </NavLink>
    </nav>
  )
}
