export function collorChoosing(rating: number) {
    if (rating > 4.6 && rating < 5) {
        return {
            background: "#39fc12",
            borderColor: "#024212",
            glyphColor: "#fff",
        };
    }else if(rating >= 4.2 && rating <= 4.5) {
        return {
            background: "#b8df0e",
            borderColor: "#263002",
            glyphColor: "#fff",
        };
    }else if( rating >= 3 && rating <= 3.5){
        return {
            background: "#f6fa0e",
            borderColor: "#423602",
            glyphColor: "#faffcc",
        };
    }
    else if(rating >= 2 && rating <= 2.9) {
        return {
            background: "#df620e",
            borderColor: "#301402",
            glyphColor: "#fff",
        };
    }else if(rating >= 1 && rating <= 1.9) {
        return {
            background: "#df0e0e",
            borderColor: "#300202",
            glyphColor: "#fff",
        };
    }

    return {
        background: "#616161",
        borderColor: "#201717",
        glyphColor: "#fdfdfd",
    };
}