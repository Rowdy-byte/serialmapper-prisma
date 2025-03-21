let formDeleted = $state(false);

export function getformDelete() {
    function toggle() {
        formDeleted = !formDeleted;
    }
    return {
        get formDeleted() {
            return formDeleted;
        },
        toggle
    };

}