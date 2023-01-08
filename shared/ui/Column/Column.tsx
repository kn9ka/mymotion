import React from 'react'
import styles from './styles.module.scss'

export const Column = ({ children }: {children: React.ReactNode }) => {
  return <div className={styles.container}>{children}</div>
}
