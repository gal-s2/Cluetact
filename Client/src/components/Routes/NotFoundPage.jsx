import { Link } from "react-router-dom";

import PageNotFoungImg from '../../assets/Cluetact404.png';
import styles from './NotFoundPage.module.css';

function NotFoundPage() {
    return (
        <Link to={"/"}>
            <div className={styles.notFoundPage}>
                <img src={PageNotFoungImg} />
            </div>
        </Link>    
    );
}

export default NotFoundPage;