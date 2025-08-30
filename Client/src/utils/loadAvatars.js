const images = import.meta.glob("../assets/avatars/*.png", { eager: true });

const avatarList = Object.entries(images)
    .sort(([a], [b]) => {
        const numA = parseInt(a.match(/avatar_(\d+)\.png$/)?.[1]);
        const numB = parseInt(b.match(/avatar_(\d+)\.png$/)?.[1]);
        return numA - numB;
    })
    .map(([, mod]) => mod.default);

const indexedAvatarList = {};
avatarList.forEach((avatarSrc, index) => {
    indexedAvatarList[index] = avatarSrc;
});

export default indexedAvatarList;
