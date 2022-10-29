export const ERRORS = {
    NO_UNITY_CLIENT: "no_unity_client",
    MISSING_CLIENT_ID: "no_client_id",
    SOCKET_ID_NOT_IN_SESSION: "socket_id_not_in_session",
    NULL_MAP: "null_map",
    FACTORY_ERROR: "factory_error",
    USER_NOT_IN_GAME: "user_not_in_game",
    MAP_ALREADY_DEFINED: "map_already_defined",
    NO_AVAILABLE_SHELF: "no_available_shelf",
    NOT_SHELF_PLACEABLE: "not_shelf_placeable",
    MIN_NOT_SATISFIED: "min_not_satisfied",
    MAX_NOT_SATISFIED: "max_not_satisfied",
    MISSING_COMPULSORY: "missing_compulsory"
};

export const END_GAME_MESSAGES = {
    key_collected:
        "Ollie got the key! Better luck next time!\nThanks for playing!",
    player_killed:
        "You Win! Ollie got caught by the pumpkin monster (Patrick)\nThanks for playing!"
};

export default {
    CLIENT_COOKIE_KEY: "client_id",
    ADMIN_COOKIE_KEY: "admin_id",
    AUTOPILOT_STREAM_KEY: "streamkey"
};
