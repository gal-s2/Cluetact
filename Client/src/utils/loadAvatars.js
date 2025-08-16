const images = import.meta.glob("../assets/avatars/*.png", { eager: true });

const avatarList = Object.entries(images)
    .sort(([a], [b]) => {
        const numA = parseInt(a.match(/(\d+)\.png$/)?.[1]);
        const numB = parseInt(b.match(/(\d+)\.png$/)?.[1]);
        return numA - numB;
    })
    .map(([, mod]) => mod.default);

export default avatarList;
