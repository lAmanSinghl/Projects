export const up = (pgm) => {
    pgm.alterColumn("users", "password_hash", {
        notNull: false
    });
};

export const down = (pgm) => {
    pgm.alterColumn("users", "password_hash", {
        notNull: true
    });
};