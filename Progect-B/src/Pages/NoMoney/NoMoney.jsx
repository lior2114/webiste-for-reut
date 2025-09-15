import styles from './NoMoney.module.css';

export function NoMoney() {

    return(
        <div className={styles.container}>
            <div className={styles.background}>
                <div className={styles.moneyRain}>
                    {[...Array(100)].map((_, i) => (
                        <div key={i} className={styles.moneyNote} style={{
                            left: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            animationDuration: `${3 + Math.random() * 4}s`
                        }}>₪</div>
                    ))}
                </div>
            </div>
            
            <div className={styles.content}>
                <h1 className={styles.title}>
                    <span className={styles.bounce}>אין לי כסף אישה</span>
                </h1>
                
                <div className={styles.textContainer}>
                    <p className={styles.text1}>מה נראה לך אני רוטשילד</p>
                    <p className={styles.text2}>לכי לעבוד</p>
                    <p className={styles.text3}>מה חשבת בכלל שלחצת על זה</p>
                </div>
                
                <div className={styles.emojiContainer}>
                    <span className={styles.emoji}>😭</span>
                    <span className={styles.emoji}>💸</span>
                    <span className={styles.emoji}>🤑</span>
                    <span className={styles.emoji}>😤</span>
                    <span className={styles.emoji}>💔</span>
                </div>
                
                <div className={styles.buttonContainer}>
                    <button className={styles.crazyButton}>
                        <span className={styles.buttonText}>לחץ כאן אם יש לך כסף</span>
                        <div className={styles.buttonSparkles}>✨</div>
                    </button>
                </div>
                
                <div className={styles.floatingElements}>
                    <div className={styles.floatingText}>$$$</div>
                    <div className={styles.floatingText}>BROKE</div>
                    <div className={styles.floatingText}>NO MONEY</div>
                </div>
            </div>
        </div>
    )
}