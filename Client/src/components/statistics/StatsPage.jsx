import { useUser } from "../UserContext";

function StatsPage() {
    const { user } = useUser();

    return (
        <div>
            <h2>{user.username}'s Stats</h2>
            <ul>
                <li>Wins: ...</li>
                <li>Losses: ...</li>
                <li>Total Games: ...</li>
                <li>Win Rate: ...%</li>
            </ul>
        </div>
    );
}

export default StatsPage;
