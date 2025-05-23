import { Link } from "react-router-dom";

import PageNotFoundImg from "../../../assets/Cluetact404.png";
import styles from "./NotFoundPage.module.css";

function NotFoundPage() {
    return (
        <Link to={"/"}>
            <div className={styles.notFoundPage}>
                <img src={PageNotFoundImg} />
            </div>
        </Link>
    );
}

export default NotFoundPage;
