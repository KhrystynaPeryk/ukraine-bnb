'use client'

import { useEffect, useState } from "react";
import { useCurrentUser } from "../hooks/useCurrentUser.ts";
import { Listing } from "@prisma/client";
import EmptyState from "../components/EmptyState";
import PropertiesClient from "./PropertiesClient";
import Loader from "../components/Loader";

const PropertiesPage = () => {
    const { currentUser, loading: userLoading } = useCurrentUser();
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchListings = async () => {
        if (!currentUser) {
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            console.log('Fetching listings for user:', currentUser.id);

            const response = await fetch(`/api/listings?userId=${currentUser.id}`);

            if (response.ok) {
                const data = await response.json();
                setListings(data);
                setError(null);
            } else {
                const errorData = await response.json();
                console.error('API error:', errorData);
                setError(errorData.error || 'Failed to fetch listings');
            }
        } catch (error) {
            console.error('Error fetching listings:', error);
            setError('Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!userLoading) {
            fetchListings();
        }
    }, [currentUser, userLoading]);

    if (userLoading || loading) {
        return <Loader />;
    }

    if (!currentUser) {
        return (
            <EmptyState title="Unauthorized" subtitle="Please login" />
        );
    }

    if (error) {
        return (
            <EmptyState title="Error" subtitle={error} />
        );
    }

    if (listings.length === 0) {
        return (
            <EmptyState title="No properties found" subtitle="Looks like you have no properties" />
        );
    }

    return (
        <PropertiesClient 
            listings={listings} 
            onListingChange={fetchListings} // Pass refresh function
        />
    );
};

export default PropertiesPage;