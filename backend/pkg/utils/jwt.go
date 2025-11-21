package utils

import (
    "errors"
    "os"
    "time"

    "github.com/golang-jwt/jwt/v5"
)

type JWTClaim struct {
    UserID uint   `json:"user_id"`
    Email  string `json:"email"`
    jwt.RegisteredClaims
}

func GenerateJWT(userID uint, email string) (string, error) {
    claims := &JWTClaim{
        UserID: userID,
        Email:  email,
        RegisteredClaims: jwt.RegisteredClaims{
            ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
            IssuedAt:  jwt.NewNumericDate(time.Now()),
        },
    }

    token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
    tokenString, err := token.SignedString([]byte(os.Getenv("JWT_SECRET")))
    
    return tokenString, err
}

func ValidateToken(signedToken string) (*JWTClaim, error) {
    token, err := jwt.ParseWithClaims(
        signedToken,
        &JWTClaim{},
        func(token *jwt.Token) (interface{}, error) {
            return []byte(os.Getenv("JWT_SECRET")), nil
        },
    )

    if err != nil {
        return nil, err
    }

    claims, ok := token.Claims.(*JWTClaim)
    if !ok {
        return nil, errors.New("couldn't parse claims")
    }

    if claims.ExpiresAt.Time.Before(time.Now()) {
        return nil, errors.New("token expired")
    }

    return claims, nil
} 
