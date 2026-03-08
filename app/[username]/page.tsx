'use client'

import { useParams } from 'next/navigation'
import TravelerIDCard from '@/app/components/TravelerIDCard'
import styles from './PublicProfile.module.css'

export default function PublicProfilePage() {
    const params = useParams()
    const username = params.username as string

    return (
        <main className={styles["public-profile-main"]}>
            <div className={styles["card-wrapper"]}>
                <TravelerIDCard username={username} />
            </div>

            <footer className={styles["public-footer"]}>
                <p>Created with <span className={styles.brand}>SnapTrip</span> — Map your journey.</p>
            </footer>
        </main>
    )
}
